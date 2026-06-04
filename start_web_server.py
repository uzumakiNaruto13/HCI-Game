"""启动居家健身游戏平台的本地HTTP服务器 (键盘操作版 · 禁用缓存)"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 9090

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def start_server():
    directory = os.path.dirname(os.path.abspath(__file__))
    os.chdir(directory)

    with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
        print("=" * 60)
        print("居家健身游戏平台")
        print("=" * 60)
        print(f"\n本地服务器已启动!")
        print(f"\n请在浏览器中打开以下地址:")
        print(f"  http://localhost:{PORT}")
        print(f"  或 http://127.0.0.1:{PORT}")
        print(f"\n提示: 如页面显示异常，请按 Ctrl+Shift+R 强制刷新")
        print(f"\n按 Ctrl+C 停止服务器")
        print("=" * 60)

        webbrowser.open(f'http://localhost:{PORT}')

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n服务器已停止")
            sys.exit(0)

if __name__ == "__main__":
    start_server()
