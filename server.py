import os
import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

BASE = os.path.dirname(os.path.abspath(__file__))

FOLDERS = {
    "Stocks": "Stocks",
    "Foreign": "Foreign",
    "Indicates": "Indicates",
    "Comments": "Comments"
}

class Handler(SimpleHTTPRequestHandler):

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/reports":
            query = parse_qs(parsed.query)
            folder = query.get("folder", [""])[0]

            if folder not in FOLDERS:
                self.send_error(404)
                return

            folder_path = os.path.join(BASE, FOLDERS[folder])
            files = []

            if os.path.isdir(folder_path):
                for filename in os.listdir(folder_path):
                    if filename.lower().endswith(".pdf"):
                        fullpath = os.path.join(folder_path, filename)

                        if os.path.isfile(fullpath):
                            files.append({
                                "name": filename,
                                "url": FOLDERS[folder] + "/" + filename,
                                "modified": os.path.getmtime(fullpath)
                            })

            files.sort(key=lambda x: x["modified"], reverse=True)

            data = json.dumps(files, ensure_ascii=False).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(data)
            return

        return super().do_GET()


server = ThreadingHTTPServer(("127.0.0.1", 8000), Handler)

print("")
print("========================================")
print(" trendline.gr - LOCAL SERVER")
print("========================================")
print("")
print("Ανοιξε στον browser:")
print("http://127.0.0.1:8000/Index.html")
print("")
print("Μπορείς τώρα να βάζεις PDF στους φακέλους.")
print("========================================")
print("")

server.serve_forever()