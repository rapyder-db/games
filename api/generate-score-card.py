import base64
import io
import json
from http.server import BaseHTTPRequestHandler

from scripts.generate_reward_card import render_template2


def json_response(handler: BaseHTTPRequestHandler, status: int, payload: dict):
    data = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get("content-length", "0"))
            body = self.rfile.read(content_length) if content_length > 0 else b"{}"
            payload = json.loads(body.decode("utf-8"))

            name = str(payload.get("name", "")).strip()
            company_name = str(payload.get("companyName", "")).strip()
            score = payload.get("score")

            if len(name) < 2 or len(name) > 80:
                return json_response(self, 400, {"error": "Name must be between 2 and 80 characters"})

            if len(company_name) < 2 or len(company_name) > 120:
                return json_response(self, 400, {"error": "Company name must be between 2 and 120 characters"})

            if not isinstance(score, int) or score < 0 or score > 10:
                return json_response(self, 400, {"error": "Score must be an integer between 0 and 10"})

            card = render_template2(name, company_name, score, 2)
            buffer = io.BytesIO()
            card.save(buffer, format="PNG", optimize=True)
            card_url = "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")

            return json_response(self, 200, {"cardUrl": card_url})
        except Exception as error:
            return json_response(self, 500, {"error": str(error)})

    def do_GET(self):
        return json_response(self, 405, {"error": "Method Not Allowed"})

