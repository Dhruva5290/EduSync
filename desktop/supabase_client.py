"""
VisionNote Desktop Client - Supabase Realtime Sync Module
=========================================================
Lightweight REST client for pushing captured OCR lecture notes to Supabase Postgres DB
using Python's standard library `urllib.request` (zero third-party HTTP dependencies).

Compatible with PySide6 / PyQt6 desktop environments (can run safely within a QThread / worker).
"""

import json
import logging
import os
import time
import urllib.error
import urllib.request
from typing import Any, Dict, Optional, Tuple, Union

# Set up logger
logger = logging.getLogger("VisionNote.SupabaseClient")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter("[%(asctime)s] [%(levelname)s] [VisionNote] %(message)s")
    )
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class SupabaseNoteClient:
    """
    Lightweight REST client for inserting notes into Supabase `public.notes` table.
    Uses Python's standard library `urllib.request`.
    """

    DEFAULT_TIMEOUT = 12  # seconds
    MAX_RETRIES = 3
    BACKOFF_FACTOR = 1.5

    def __init__(
        self,
        supabase_url: Optional[str] = None,
        supabase_key: Optional[str] = None,
        auth_token: Optional[str] = None,
    ):
        """
        Initialize the Supabase client.

        :param supabase_url: Supabase project URL (e.g. https://xyzcompany.supabase.co).
                             Falls back to env var `SUPABASE_URL`.
        :param supabase_key: Supabase Anon Public Key.
                             Falls back to env var `SUPABASE_ANON_KEY`.
        :param auth_token: Optional authenticated user JWT token (Bearer token).
                           If omitted, the anon key is used as Bearer.
        """
        self.supabase_url = (supabase_url or os.getenv("SUPABASE_URL", "")).rstrip("/")
        self.supabase_key = supabase_key or os.getenv("SUPABASE_ANON_KEY", "")
        self.auth_token = auth_token or os.getenv("SUPABASE_USER_TOKEN", self.supabase_key)

        if not self.supabase_url:
            logger.warning("Supabase URL is not configured. Calls will fail unless set.")
        if not self.supabase_key:
            logger.warning("Supabase Anon Key is not configured. Calls will fail unless set.")

    @property
    def endpoint_url(self) -> str:
        """The PostgREST table endpoint for `notes`."""
        return f"{self.supabase_url}/rest/v1/notes"

    def _get_headers(self, custom_token: Optional[str] = None) -> Dict[str, str]:
        """Construct standard PostgREST headers."""
        token = custom_token or self.auth_token or self.supabase_key
        return {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {token}",
            "Prefer": "return=representation",  # Instructs PostgREST to return the inserted row
        }

    def upload_lecture_note(
        self,
        user_id: str,
        generalised_notes: str,
        title: str = "Untitled Capture",
        raw_ocr_text: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        user_jwt: Optional[str] = None,
    ) -> Tuple[bool, Union[Dict[str, Any], str]]:
        """
        Insert a new note row into `public.notes` with status='uploaded'.
        Includes exponential backoff retry and fallback schema handling.

        :param user_id: UUID of the authenticated student/faculty user.
        :param generalised_notes: General clean notes transcribed from the blackboard.
        :param title: Lecture or topic title.
        :param raw_ocr_text: Unprocessed OCR text from camera frames.
        :param metadata: Optional dictionary of tags, subject_id, device info, etc.
        :param user_jwt: Optional user Bearer JWT override for RLS policy satisfaction.
        :return: (True, inserted_row_dict) on success, or (False, error_message) on failure.
        """
        if not self.supabase_url or not self.supabase_key:
            error_msg = "Supabase configuration missing: SUPABASE_URL and SUPABASE_ANON_KEY must be provided."
            logger.error(error_msg)
            return False, error_msg

        # Primary Payload matching public.notes schema
        payload = {
            "user_id": user_id,
            "title": title or "Untitled Capture",
            "raw_ocr_text": raw_ocr_text or "",
            "generalised_notes": generalised_notes,
            "status": "uploaded",
            "metadata": metadata or {},
        }

        # Attempt upload with exponential backoff
        for attempt in range(1, self.MAX_RETRIES + 1):
            try:
                logger.info(
                    f"Uploading note to Supabase (attempt {attempt}/{self.MAX_RETRIES}): title='{title}'"
                )
                status_code, response_data = self._execute_post(
                    self.endpoint_url, payload, custom_token=user_jwt
                )

                if 200 <= status_code < 300:
                    inserted_row = response_data[0] if isinstance(response_data, list) and response_data else response_data
                    logger.info(
                        f"Note successfully inserted! Note ID: {inserted_row.get('id', 'unknown')}, Status: uploaded"
                    )
                    return True, inserted_row
                
                # Check for schema/validation errors (400 Bad Request)
                if status_code == 400:
                    logger.warning(f"PostgREST schema rejection (HTTP 400): {response_data}. Triggering fallback schema retry...")
                    return self._fallback_retry(user_id, generalised_notes, title, raw_ocr_text, user_jwt)

                # Check for RLS permission errors (401/403)
                if status_code in (401, 403):
                    error_msg = f"Authentication/RLS error (HTTP {status_code}): {response_data}. Ensure user JWT matches user_id."
                    logger.error(error_msg)
                    return False, error_msg

                # For server errors (5xx), continue retry loop
                logger.warning(f"Server responded with HTTP {status_code}: {response_data}")

            except urllib.error.HTTPError as http_err:
                err_body = http_err.read().decode("utf-8", errors="ignore")
                logger.warning(f"HTTP error {http_err.code} on attempt {attempt}: {err_body}")

                if http_err.code == 400:
                    return self._fallback_retry(user_id, generalised_notes, title, raw_ocr_text, user_jwt)
                if http_err.code in (401, 403):
                    return False, f"Supabase Permission Denied (HTTP {http_err.code}): {err_body}"

            except (urllib.error.URLError, TimeoutError) as net_err:
                logger.warning(f"Network error on attempt {attempt}: {net_err}")

            # Exponential backoff sleep before next attempt
            if attempt < self.MAX_RETRIES:
                sleep_time = self.BACKOFF_FACTOR ** attempt
                logger.info(f"Retrying in {sleep_time:.2f} seconds...")
                time.sleep(sleep_time)

        final_err = f"Failed to upload note after {self.MAX_RETRIES} attempts."
        logger.error(final_err)
        return False, final_err

    def _fallback_retry(
        self,
        user_id: str,
        generalised_notes: str,
        title: str,
        raw_ocr_text: Optional[str],
        user_jwt: Optional[str],
    ) -> Tuple[bool, Union[Dict[str, Any], str]]:
        """
        Fallback schema attempt: Strictest minimal payload with empty metadata
        in case custom metadata fields trigger strict constraint or type mismatches.
        """
        logger.info("Executing minimal fallback payload retry...")
        minimal_payload = {
            "user_id": user_id,
            "title": title or "Untitled Capture",
            "raw_ocr_text": raw_ocr_text or "",
            "generalised_notes": generalised_notes,
            "status": "uploaded",
            "metadata": {},
        }
        try:
            status_code, response_data = self._execute_post(
                self.endpoint_url, minimal_payload, custom_token=user_jwt
            )
            if 200 <= status_code < 300:
                inserted_row = response_data[0] if isinstance(response_data, list) and response_data else response_data
                logger.info(f"Fallback retry succeeded! Note ID: {inserted_row.get('id', 'unknown')}")
                return True, inserted_row
            return False, f"Fallback retry failed with HTTP {status_code}: {response_data}"
        except Exception as e:
            return False, f"Fallback retry encountered exception: {e}"

    def _execute_post(
        self, url: str, data: Dict[str, Any], custom_token: Optional[str] = None
    ) -> Tuple[int, Any]:
        """Execute HTTP POST using urllib.request."""
        body_bytes = json.dumps(data).encode("utf-8")
        headers = self._get_headers(custom_token=custom_token)

        req = urllib.request.Request(url, data=body_bytes, headers=headers, method="POST")

        with urllib.request.urlopen(req, timeout=self.DEFAULT_TIMEOUT) as response:
            status_code = response.getcode()
            raw_body = response.read().decode("utf-8")
            try:
                parsed_json = json.loads(raw_body)
            except json.JSONDecodeError:
                parsed_json = {"raw": raw_body}
            return status_code, parsed_json


# =====================================================================
# PySide6 Worker Integration Helper (Demonstration Pattern)
# =====================================================================
"""
Example PySide6 Worker Thread Usage:

from PySide6.QtCore import QThread, Signal

class NoteUploadWorker(QThread):
    finished = Signal(bool, object)  # (success, result_or_error)

    def __init__(self, client: SupabaseNoteClient, user_id: str, text: str, title: str):
        super().__init__()
        self.client = client
        self.user_id = user_id
        self.text = text
        self.title = title

    def run(self):
        success, result = self.client.upload_lecture_note(
            user_id=self.user_id,
            generalised_notes=self.text,
            title=self.title
        )
        self.finished.emit(success, result)
"""

if __name__ == "__main__":
    # Self-test script when executed standalone
    print("Testing SupabaseNoteClient initialization...")
    client = SupabaseNoteClient()
    print(f"Target endpoint: {client.endpoint_url}")
    print("Client initialized successfully.")
