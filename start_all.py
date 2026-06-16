"""
居家健身游戏平台 — 一键启动所有服务
运行: python start_all.py
"""
import subprocess
import sys
import os
import time

os.chdir(os.path.dirname(os.path.abspath(__file__)))

services = [
    ("Web服务器",        [sys.executable, "start_web_server.py"]),
    ("手机IMU中继",      [sys.executable, "ws_server.py"]),
    ("侧摄像头AI",       [sys.executable, "sidecam_processor.py"]),
    ("卡路里AI教练",     [sys.executable, "kcal_ai_service.py"]),
    ("FastAPI后端",      [sys.executable, "-m", "uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000"]),
]

procs = []
for name, cmd in services:
    print(f"[启动] {name}...")
    try:
        p = subprocess.Popen(cmd, creationflags=subprocess.CREATE_NEW_CONSOLE if sys.platform == 'win32' else 0)
        procs.append((name, p))
        print(f"  ✅ {name} PID={p.pid}")
    except Exception as e:
        print(f"  ❌ {name} 启动失败: {e}")

print(f"\n🎮 全部 {len(procs)}/{len(services)} 个服务已启动")
print("  http://localhost:9090")
print("  按 Ctrl+C 停止所有服务")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n停止所有服务...")
    for name, p in procs:
        p.terminate()
    print("已停止")
