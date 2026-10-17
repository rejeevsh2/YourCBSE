"""One-time converter-to-R2 smoke test, with no access to existing lesson files.

Writes a unique tiny private object, reads it back, and removes only that object.
Never prints credentials, endpoint URLs or R2 object keys.
"""

import os
import secrets
import sys

import boto3
from botocore.config import Config


def main() -> int:
    key = "lessons/_converter_checks/" + secrets.token_hex(20) + ".txt"
    payload = b"YourSchool preview converter R2 connectivity check v1"
    created = False
    success = False

    try:
        client = boto3.client(
            "s3",
            endpoint_url=os.environ["R2_ENDPOINT"],
            aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
            aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
            region_name=os.environ.get("R2_REGION", "auto"),
            config=Config(connect_timeout=8, read_timeout=12, retries={"max_attempts": 2}),
        )
        bucket = os.environ["R2_BUCKET"]
        client.put_object(
            Bucket=bucket,
            Key=key,
            Body=payload,
            ContentType="text/plain",
            CacheControl="private, no-store",
        )
        created = True

        received = client.get_object(Bucket=bucket, Key=key)["Body"].read()
        if received != payload:
            raise ValueError("Unexpected R2 response content")
        success = True
    except Exception as exc:
        print("CONVERTER_R2_SMOKE_FAILED: " + type(exc).__name__, file=sys.stderr)
    finally:
        if created:
            try:
                client.delete_object(Bucket=bucket, Key=key)
            except Exception as exc:
                success = False
                print("CONVERTER_R2_CLEANUP_FAILED: " + type(exc).__name__, file=sys.stderr)

    if success:
        print("CONVERTER_R2_SMOKE_OK")
        return 0
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
