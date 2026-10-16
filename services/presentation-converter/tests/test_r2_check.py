import io
import unittest
from unittest.mock import MagicMock, patch

from check_r2 import main


class R2SmokeTest(unittest.TestCase):
    @patch("check_r2.boto3.client")
    def test_writes_reads_and_deletes_only_temporary_object(self, create_client):
        client = MagicMock()
        create_client.return_value = client
        client.get_object.return_value = {"Body": io.BytesIO(b"YourSchool preview converter R2 connectivity check v1")}

        env = {
            "R2_ENDPOINT": "https://fake.r2.cloudflarestorage.com",
            "R2_ACCESS_KEY_ID": "fake",
            "R2_SECRET_ACCESS_KEY": "fake",
            "R2_BUCKET": "test-bucket",
        }

        with patch.dict("os.environ", env):
            with patch("builtins.print"):
                self.assertEqual(main(), 0)

        written = client.put_object.call_args.kwargs
        removed = client.delete_object.call_args.kwargs
        self.assertEqual(written["Bucket"], "test-bucket")
        self.assertTrue(written["Key"].startswith("lessons/_converter_checks/"))
        self.assertEqual(removed, {"Bucket": "test-bucket", "Key": written["Key"]})

    @patch("check_r2.boto3.client")
    def test_read_failure_still_cleans_up(self, create_client):
        client = MagicMock()
        create_client.return_value = client
        client.get_object.side_effect = RuntimeError("fake failure")
        with patch.dict("os.environ", {
            "R2_ENDPOINT": "https://fake.r2.cloudflarestorage.com",
            "R2_ACCESS_KEY_ID": "fake",
            "R2_SECRET_ACCESS_KEY": "fake",
            "R2_BUCKET": "test-bucket",
        }):
            with patch("builtins.print"):
                self.assertEqual(main(), 1)
        client.delete_object.assert_called_once()


if __name__ == "__main__":
    unittest.main()
