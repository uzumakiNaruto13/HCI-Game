"""
侧面摄像头算力分担端
拉取 IP 摄像头流 → MediaPipe Pose → JSON 坐标 → WebSocket 推送
运行: pip install mediapipe opencv-python websockets
"""
import asyncio
import json
import cv2
import mediapipe as mp
import websockets

IP_CAM_URL = "http://10.124.139.147:8080/video"
WS_PORT = 8082  # 独立端口，不跟手机 IMU 8080 冲突

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    model_complexity=1,
    smooth_landmarks=True,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6
)

clients = set()
latest_landmarks = None


async def handler(websocket):
    clients.add(websocket)
    print(f"[SideCam] 浏览器连接 ({len(clients)}个)")
    try:
        async for _ in websocket: pass
    finally:
        clients.remove(websocket)


async def process_camera():
    global latest_landmarks
    print(f"[SideCam] 连接 IP 摄像头: {IP_CAM_URL}")
    cap = cv2.VideoCapture(IP_CAM_URL)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)

    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            await asyncio.sleep(0.1)
            continue

        frame = cv2.resize(frame, (640, 480))
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb)

        frame_count += 1
        if results.pose_landmarks:
            landmarks = []
            for lm in results.pose_landmarks.landmark:
                landmarks.append({
                    "x": 1.0 - lm.x,
                    "y": lm.y, "z": lm.z,
                    "visibility": lm.visibility
                })
            # 世界坐标（含深度）
            world_landmarks = None
            if results.pose_world_landmarks:
                world_landmarks = []
                for lm in results.pose_world_landmarks.landmark:
                    world_landmarks.append({
                        "x": -lm.x,  # 镜像：世界坐标 X 取反
                        "y": lm.y, "z": lm.z,
                        "visibility": lm.visibility
                    })
            latest_landmarks = {
                "type": "side_pose",
                "landmarks": landmarks,
                "world_landmarks": world_landmarks,
                "frame": frame_count
            }
            # 广播给所有浏览器客户端
            msg = json.dumps(latest_landmarks)
            if clients:
                await asyncio.gather(
                    *[ws.send(msg) for ws in clients],
                    return_exceptions=True
                )
        await asyncio.sleep(0.001)  # 让出 CPU


async def main():
    print(f"[SideCam] WebSocket 服务启动: ws://0.0.0.0:{WS_PORT}")
    async with websockets.serve(handler, "0.0.0.0", WS_PORT):
        await process_camera()


if __name__ == "__main__":
    asyncio.run(main())
