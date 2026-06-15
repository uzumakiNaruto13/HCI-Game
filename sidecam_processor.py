"""
侧面摄像头算力分担端 (MediaPipe 新版 API)
拉取 IP 摄像头流 → PoseLandmarker → JSON 坐标 → WebSocket 推送
"""
import asyncio
import json
import cv2
import mediapipe as mp
import websockets
import numpy as np
import base64

IP_CAM_URL = "http://10.124.123.191:8080/video"
WS_PORT = 8082

# 新版 API: PoseLandmarker
BaseOptions = mp.tasks.BaseOptions
PoseLandmarker = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = PoseLandmarkerOptions(
    base_options=BaseOptions(model_asset_path='pose_landmarker_lite.task'),
    running_mode=VisionRunningMode.VIDEO,
    num_poses=1,
    min_pose_detection_confidence=0.6,
    min_pose_presence_confidence=0.6,
    min_tracking_confidence=0.6
)

clients = set()
latest_landmarks = None
landmarker = PoseLandmarker.create_from_options(options)


async def handler(websocket):
    clients.add(websocket)
    print(f"[SideCam] 浏览器连接 ({len(clients)}个)")
    status = "connected" if latest_landmarks else "waiting"
    await websocket.send(json.dumps({"type": "side_status", "status": status}))
    try:
        async for _ in websocket:
            pass
    finally:
        clients.remove(websocket)
        print(f"[SideCam] 浏览器断开 ({len(clients)}个)")


async def process_camera():
    global latest_landmarks
    print(f"[SideCam] 尝试连接 IP 摄像头: {IP_CAM_URL}")
    cap = cv2.VideoCapture(IP_CAM_URL)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)

    if not cap.isOpened():
        print(f"[SideCam] [FAIL] IP 摄像头连接失败: {IP_CAM_URL}, 5秒后重试...")
        await asyncio.sleep(5)
        return await process_camera()
    print(f"[SideCam] [OK] IP 摄像头已连接: {IP_CAM_URL}")

    frame_count = 0
    fail_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            fail_count += 1
            if fail_count == 1:
                print(f"[SideCam] [WARN] 读取帧失败，等待恢复...")
            if fail_count % 30 == 0:
                print(f"[SideCam] [WARN] 持续丢帧 ({fail_count}次)")
            await asyncio.sleep(0.1)
            continue
        fail_count = 0

        frame = cv2.resize(frame, (640, 480))
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # 编码缩略图 JPEG
        thumb = cv2.resize(frame, (320, 240))
        _, jpg = cv2.imencode('.jpg', thumb, [cv2.IMWRITE_JPEG_QUALITY, 35])
        frame_jpg = base64.b64encode(jpg).decode('utf-8')

        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        frame_count += 1
        timestamp_ms = int(frame_count * 33.33)
        result = landmarker.detect_for_video(mp_image, timestamp_ms)

        if result.pose_landmarks:
            landmarks = []
            for lm in result.pose_landmarks[0]:
                landmarks.append({
                    "x": 1.0 - lm.x,
                    "y": lm.y, "z": lm.z,
                    "visibility": lm.visibility or 1.0
                })
            # 世界坐标 (新版 API 可能不提供)
            world_list = []
            if result.pose_world_landmarks:
                for lm in result.pose_world_landmarks[0]:
                    world_list.append({
                        "x": -lm.x, "y": lm.y, "z": lm.z,
                        "visibility": lm.visibility or 1.0
                    })

            latest_landmarks = {
                "type": "side_pose",
                "landmarks": landmarks,
                "world_landmarks": world_list if world_list else None,
                "frame": frame_count,
                "frame_jpg": frame_jpg
            }
            msg = json.dumps(latest_landmarks)
            if clients:
                await asyncio.gather(
                    *[ws.send(msg) for ws in clients],
                    return_exceptions=True
                )
        await asyncio.sleep(0.001)


async def main():
    print(f"[SideCam] WebSocket 服务启动: ws://0.0.0.0:{WS_PORT}")
    async with websockets.serve(handler, "0.0.0.0", WS_PORT):
        await process_camera()


if __name__ == "__main__":
    asyncio.run(main())
