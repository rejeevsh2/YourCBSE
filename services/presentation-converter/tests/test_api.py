import hashlib
import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app import app, busy


class ConverterApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.token = "z" * 40
        self.key = "lessons/17/files/11111111-2222-4333-8444-555555555555.pptx"
        self.prefix = "lessons/17/previews/29/" + hashlib.sha256(self.key.encode()).hexdigest()[:24]
        self.request = {
            "lesson_id": 17,
            "content_id": 29,
            "source_key": self.key,
            "preview_prefix": self.prefix,
        }

    def test_no_token_is_rejected(self):
        with patch.dict(os.environ, {"PRESENTATION_CONVERTER_TOKEN": self.token}):
            response = self.client.post("/convert", json=self.request)
        self.assertEqual(response.status_code, 401)

    def test_invalid_token_is_rejected(self):
        with patch.dict(os.environ, {"PRESENTATION_CONVERTER_TOKEN": self.token}):
            response = self.client.post("/convert", json=self.request, headers={"Authorization": "Bearer wrong"})
        self.assertEqual(response.status_code, 401)

    def test_mismatched_namespace_is_rejected_without_processing(self):
        forged = dict(self.request)
        forged["preview_prefix"] = "lessons/18/previews/29/not-allowed"
        with patch.dict(os.environ, {"PRESENTATION_CONVERTER_TOKEN": self.token}):
            response = self.client.post("/convert", json=forged, headers={"Authorization": "Bearer " + self.token})
        self.assertEqual(response.status_code, 422)

    def test_authenticated_valid_request_dispatches(self):
        with patch.dict(os.environ, {"PRESENTATION_CONVERTER_TOKEN": self.token}):
            with patch("app.convert_presentation") as conversion:
                response = self.client.post("/convert", json=self.request, headers={"Authorization": "Bearer " + self.token})
        self.assertEqual(response.status_code, 202)
        conversion.assert_called_once()

    def test_worker_rejects_concurrent_requests(self):
        self.assertTrue(busy.acquire(blocking=False))
        try:
            with patch.dict(os.environ, {"PRESENTATION_CONVERTER_TOKEN": self.token}):
                response = self.client.post("/convert", json=self.request, headers={"Authorization": "Bearer " + self.token})
            self.assertEqual(response.status_code, 429)
        finally:
            busy.release()


if __name__ == "__main__":
    unittest.main()
