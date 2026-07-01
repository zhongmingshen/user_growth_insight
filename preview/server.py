from __future__ import annotations

import json
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from user_growth_insight.api.metrics import aggregate_lifecycle  # noqa: E402


DATA_FILE = ROOT / "user_growth_insight" / "data" / "user_service_lifecycle_mock.json"


class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT / "preview"), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/dashboard":
            self.send_dashboard(parsed.query)
            return
        if parsed.path == "/":
            self.path = "/index.html"
        super().do_GET()

    def send_dashboard(self, query: str) -> None:
        filters = {
            key: values[0]
            for key, values in parse_qs(query).items()
            if values and values[0]
        }
        records = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        payload = aggregate_lifecycle(records, filters)
        content = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8088
    server = ThreadingHTTPServer(("127.0.0.1", port), PreviewHandler)
    print(f"User Growth Insight preview: http://127.0.0.1:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
