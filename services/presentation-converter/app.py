"""Isolated PowerPoint-to-JPEG renderer. Never returns raw slide bytes to public callers."""

import hashlib
import hmac
import json
import logging
import os
from pathlib import Path
import re
import subprocess
import tempfile
import threading

import boto3
from fastapi import BackgroundTasks, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="YourSchool private presentation converter", docs_url=None, redoc_url=None)
log = logging.getLogger("presentation-converter")
busy = threading.Lock()
MAX_SOURCE_BYTES = 100 * 1024 * 1024
MAX_SLIDES = 80
KEY_PATTERN = re.compile(r"^lessons/(\d+)/files/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\.(ppt|pptx)$", re.I)


class ConversionRequest(BaseModel):
    lesson_id: int = Field(ge=1)
    content_id: int = Field(ge=1)
    source_key: str = Field(min_length=1, max_length=512)
    preview_prefix: str = Field(min_length=1, max_length=512)


def validate_request(req: ConversionRequest) -> None:
    match = KEY_PATTERN.fullmatch(req.source_key)
    if not match or int(match.group(1)) != req.lesson_id:
        raise HTTPException(status_code=422, detail="Invalid source file key.")

    version = hashlib.sha256(req.source_key.encode("utf-8")).hexdigest()[:24]
    expected = f"lessons/{req.lesson_id}/previews/{req.content_id}/{version}"
    if not hmac.compare_digest(req.preview_prefix, expected):
        raise HTTPException(status_code=422, detail="Invalid slide destination.")


def s3_client():
    return boto3.client(
        "s3",
        endpoint_url=os.environ["R2_ENDPOINT"],
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        region_name=os.environ.get("R2_REGION", "auto"),
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/convert", status_code=202)
def convert(
    req: ConversionRequest,
    tasks: BackgroundTasks,
    authorization: str | None = Header(default=None),
):
    configured = os.environ.get("PRESENTATION_CONVERTER_TOKEN", "")
    expected = f"Bearer {configured}"
    if len(configured) < 32 or not authorization or not hmac.compare_digest(authorization, expected):
        raise HTTPException(status_code=401, detail="Unauthorized.")

    validate_request(req)
    if not busy.acquire(blocking=False):
        raise HTTPException(status_code=429, detail="Converter is busy. Retry shortly.")

    tasks.add_task(convert_and_release, req)
    return {"status": "accepted"}


def convert_and_release(req: ConversionRequest) -> None:
    try:
        convert_presentation(req)
    except Exception:
        # Do not log R2 signed URLs, secrets, source bytes or full user data.
        log.exception("Conversion failed for content %d", req.content_id)
    finally:
        busy.release()


def convert_presentation(req: ConversionRequest) -> None:
    client = s3_client()
    bucket = os.environ["R2_BUCKET"]
    info = client.head_object(Bucket=bucket, Key=req.source_key)
    if info["ContentLength"] > MAX_SOURCE_BYTES:
        raise ValueError("Presentation exceeds the configured source size limit.")

    with tempfile.TemporaryDirectory(prefix="yourschool-slides-") as tmp:
        root = Path(tmp)
        source = root / ("input." + req.source_key.rsplit(".", 1)[1].lower())
        client.download_file(bucket, req.source_key, str(source))

        pdfdir = root / "pdf"
        pdfdir.mkdir()
        profile = root / "office-profile"
        subprocess.run(
            [
                "libreoffice", "-env:UserInstallation=" + profile.as_uri(),
                "--headless", "--convert-to", "pdf", "--outdir",
                str(pdfdir), str(source),
            ],
            check=True, timeout=180, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
        )
        pdf = pdfdir / "input.pdf"
        if not pdf.is_file() or not pdf.stat().st_size:
            raise ValueError("LibreOffice produced no slides.")

        info = subprocess.run(
            ["pdfinfo", str(pdf)],
            check=True, timeout=15, capture_output=True, text=True,
        )
        found = re.search(r"^Pages:\s*(\d+)\s*$", info.stdout, re.M)
        pages = int(found.group(1)) if found else 0
        if pages < 1 or pages > MAX_SLIDES:
            raise ValueError("Presentation must contain between 1 and 80 slides.")

        slidesdir = root / "slides"
        slidesdir.mkdir()
        subprocess.run(
            [
                "pdftoppm", "-f", "1", "-l", str(pages), "-jpeg",
                "-jpegopt", "quality=85", "-scale-to", "1600",
                str(pdf), str(slidesdir / "page"),
            ],
            check=True, timeout=180, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
        )

        objects = []
        for index in range(1, pages + 1):
            path = slidesdir / f"page-{index}.jpg"
            if not path.is_file() or path.stat().st_size > 10 * 1024 * 1024:
                raise ValueError("Could not render a slide safely.")
            key = f"{req.preview_prefix}/slides/slide-{index:04d}.jpg"
            with path.open("rb") as image_file:
                client.put_object(
                    Bucket=bucket, Key=key, Body=image_file,
                    ContentType="image/jpeg", CacheControl="private, no-store",
                )
            objects.append(key)

        # Publish last. An absent manifest means processing/incomplete.
        manifest = json.dumps({"version": 1, "slides": objects}, separators=(",", ":"))
        client.put_object(
            Bucket=bucket, Key=req.preview_prefix + "/manifest.json",
            Body=manifest.encode("utf-8"), ContentType="application/json",
            CacheControl="private, no-store",
        )
        log.info("Rendered %d slides for content %d", pages, req.content_id)
