#!/usr/bin/env python3
"""Local, dependency-free presentation server. Bind to loopback only."""

from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import mimetypes
import os
from pathlib import Path
import secrets
import sys
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parent
STATIC = ROOT / "static"
RECORDS = {
    "104": {"id": "104", "name": "Alex Rivera", "group": "1.º A", "owner": "alex", "document": "Constancia de inscripción", "status": "Disponible"},
    "105": {"id": "105", "name": "Sam Ortega", "group": "3.º B", "owner": "sam", "document": "Constancia de inscripción", "status": "Disponible"},
}
SESSIONS = set()


class Handler(BaseHTTPRequestHandler):
    def _session(self):
        jar = SimpleCookie()
        try:
            jar.load(self.headers.get("Cookie", ""))
        except Exception:
            return None
        token = jar.get("demo_session")
        return token.value if token and token.value in SESSIONS else None

    def _send(self, status, content, content_type, cookie=None):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Security-Policy", "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; frame-ancestors 'none'")
        if cookie:
            self.send_header("Set-Cookie", f"demo_session={cookie}; HttpOnly; SameSite=Strict; Path=/")
        self.end_headers()
        self.wfile.write(content)

    def _json(self, status, body, cookie=None):
        self._send(status, json.dumps(body, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8", cookie)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == "/api/session":
            token = self._session()
            if not token:
                token = secrets.token_urlsafe(32)
                SESSIONS.add(token)
            self._json(HTTPStatus.OK, {"user": "alex", "display_name": "Alex Rivera", "record_id": "104"}, token)
            return

        if path.startswith("/api/"):
            if not self._session():
                self._json(HTTPStatus.UNAUTHORIZED, {"error": "Primero inicia la sesión ficticia de Alex."})
                return
            parts = path.strip("/").split("/")
            if len(parts) != 4 or parts[0] != "api" or parts[1] not in {"vulnerable", "protected"} or parts[2] != "expedientes":
                self._json(HTTPStatus.NOT_FOUND, {"error": "Ruta no encontrada."})
                return
            mode, record_id = parts[1], parts[3]
            record = RECORDS.get(record_id)
            if not record:
                self._json(HTTPStatus.NOT_FOUND, {"error": "Ese expediente no existe en la simulación."})
                return
            # Vulnerable route: checks a session but omits object-level authorization.
            # Protected route: checks the owner of the requested record server-side.
            if mode == "protected" and record["owner"] != "alex":
                self._json(HTTPStatus.FORBIDDEN, {"error": "Acceso denegado: este expediente no pertenece a Alex."})
                return
            self._json(HTTPStatus.OK, {key: value for key, value in record.items() if key != "owner"})
            return

        if path == "/":
            path = "/index.html"
        file_path = (STATIC / path.lstrip("/")).resolve()
        if not file_path.is_relative_to(STATIC) or not file_path.is_file():
            self._send(HTTPStatus.NOT_FOUND, b"Not found", "text/plain; charset=utf-8")
            return
        content_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
        self._send(HTTPStatus.OK, file_path.read_bytes(), content_type + ("; charset=utf-8" if content_type.startswith(("text/", "application/javascript")) else ""))


def main():
    port = int(os.environ.get("PORT", "8765"))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    except OSError as error:
        sys.exit(f"No pude iniciar el servidor en el puerto {port}: {error}. Prueba PORT=8766 python3 server.py")
    print(f"Presentación lista: http://127.0.0.1:{port}", flush=True)
    print("Presiona Ctrl+C para detenerla.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
