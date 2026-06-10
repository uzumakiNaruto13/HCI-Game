"""
手机陀螺仪 WebSocket 接收服务器
接收 sensor.html 发来的腿部 IMU 数据，广播给浏览器端
"""
import asyncio
import json
import websockets

PORT = 8080
connected_clients = set()
latest_imu = {"beta": 0, "gamma": 0, "alpha": 0, "ts": 0}


async def handler(websocket):
    connected_clients.add(websocket)
    print(f"[WS] 客户端连接 ({len(connected_clients)} 个)")
    try:
        async for message in websocket:
            data = json.loads(message)
            if data.get("type") == "leg_imu":
                latest_imu["beta"] = data["beta"]
                latest_imu["gamma"] = data["gamma"]
                latest_imu["alpha"] = data["alpha"]
                latest_imu["ts"] = data["ts"]
            # 广播给所有客户端（手机→PC浏览器）
            websockets.broadcast(connected_clients, message)
    finally:
        connected_clients.remove(websocket)
        print(f"[WS] 客户端断开 ({len(connected_clients)} 个)")


async def main():
    print(f"[WS] WebSocket 服务启动: ws://0.0.0.0:{PORT}")
    async with websockets.serve(handler, "0.0.0.0", PORT):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
