from http.server import SimpleHTTPRequestHandler, HTTPServer
from pyngrok import ngrok
import threading
import os

PORT = 3000

# Запуск локального сервера
def run_server():
    os.chdir(".")  # папка проекта (там где .next / build)
    server = HTTPServer(("0.0.0.0", PORT), SimpleHTTPRequestHandler)
    print(f"Local server running on http://localhost:{PORT}")
    server.serve_forever()

# Запуск в отдельном потоке
thread = threading.Thread(target=run_server)
thread.start()

# Запуск ngrok
public_url = ngrok.connect(PORT)
print("PUBLIC URL:", public_url)
