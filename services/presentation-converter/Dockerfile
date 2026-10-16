FROM python:3.12-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libreoffice-impress poppler-utils fonts-liberation fontconfig \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --uid 10001 --create-home converter

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
COPY check_r2.py .
COPY smoke_convert.py .

USER converter
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1"]
