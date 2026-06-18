"""
卡路里AI助手服务 - 浏览器 → Python → 小米Mimo
运行: python kcal_ai_service.py  (端口 8083)
"""
import asyncio
import json
import os
from datetime import datetime
from websockets import serve
from dotenv import load_dotenv
load_dotenv(override=True)

API_KEY = os.getenv("MIMO_API_KEY", "")
API_URL = os.getenv("MIMO_API_URL", "https://token-plan-cn.xiaomimimo.com/v1/chat/completions")
MODEL = os.getenv("MIMO_MODEL", "mimo-v2.5")

async def call_glm(websocket, messages):
    """调用智谱GLM API"""
    import aiohttp
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    body = {
        "model": MODEL,
        "messages": messages,
        "stream": True
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(API_URL, json=body, headers=headers, timeout=aiohttp.ClientTimeout(total=20)) as resp:
                if resp.status == 200:
                    full = ""
                    buf = ""
                    # 使用 iter_any() 避免换行符阻塞
                    async for chunk_bytes in resp.content.iter_any():
                        buf += chunk_bytes.decode('utf-8', errors='ignore')
                        while '\n' in buf:
                            line, buf = buf.split('\n', 1)
                            text = line.strip()
                            if text.startswith("data: ") and text != "data: [DONE]":
                                try:
                                    chunk = json.loads(text[6:])
                                    # 兼容多种 delta 格式
                                    choices = chunk.get("choices", [])
                                    if choices:
                                        delta = choices[0].get("delta", {})
                                        content = delta.get("content") or delta.get("text") or ""
                                        if not content:
                                            content = choices[0].get("text", "")
                                        if content:
                                            full += content
                                            await websocket.send(json.dumps({"type": "reply_chunk", "text": content}))
                                except Exception as e:
                                    print(f"[解析错误] {e} | raw: {text[:100]}")
                    await websocket.send(json.dumps({"type": "reply_done"}))
                    return full
                err = await resp.text()
                await websocket.send(json.dumps({"type": "reply", "text": f"[API {resp.status}]"}))
                return f"[API {resp.status}]"
    except Exception as e:
        await websocket.send(json.dumps({"type": "reply", "text": f"[错误: {str(e)[:30]}]"}))
        return ""


async def handler(websocket):
    """WebSocket 连接处理"""
    print(f"[Kcal AI] 浏览器连接")
    history = []
    try:
        async for raw in websocket:
            msg = json.loads(raw)
            if msg.get("type") == "chat":
                question = msg.get("question", "")
                data_ctx = msg.get("data", "")

                system_prompt = """你是居家健身AI教练「卡卡」，服务于一个体感游戏健身平台。性格阳光鼓励型，像朋友聊天一样亲切。

【平台信息】
平台有4款体感游戏，通过摄像头AI识别身体动作来操控：
1. 🏃 地铁跑酷 - 无尽奔跑，原地跳跃=角色跳，下蹲=滑铲，Shift=加速，X=冲刺斩击。中等强度有氧。
2. 🏀 投篮挑战 - 3D篮球场，真实物理。行走靠近球=捡球，深蹲=蓄力投篮，站起=出手。含防守AI对手。高强度全身运动。
3. 🎮 Galgame - 视觉小说，挥动手臂翻页对话，点头确认选择。低强度休闲。
4. 🧩 体感方块 - 俄罗斯方块，举手左/右=移动方块，双臂交叉=旋转，点头=加速下落。中低强度脑体结合。

【卡路里参考】
- 投篮挑战：约 5-8 kcal/分钟（高）
- 地铁跑酷：约 3-5 kcal/分钟（中）
- 体感方块：约 1-3 kcal/分钟（中低）
- Galgame：约 0.5-1 kcal/分钟（低）

【分析要求】
用户会提供今日运动数据（次数、kcal、分钟、峰值时段、7天趋势）。请：
1. 结合具体游戏类型给出针对性建议（如"投篮消耗大，可以多来几局"）
2. 根据时段推荐合适的游戏（早上适合投篮提神，晚上适合Galgame放松）
3. 鼓励多样化运动，避免只玩一种游戏
4. 每次回复30-60字，语气活泼像健身伙伴，多用emoji"""
                user_msg = f"我的运动数据：{data_ctx}\n问题：{question}"

                history.append({"role": "user", "content": user_msg})
                messages = [{"role": "system", "content": system_prompt}] + history[-4:]

                print(f"[Kcal AI] 用户提问: {question[:30]}...")
                reply = await call_glm(websocket, messages)
                if reply:
                    history.append({"role": "assistant", "content": reply})
    except Exception as e:
        print(f"[Kcal AI] 连接关闭: {e}")


async def main():
    print(f"[Kcal AI] 健身教练AI服务启动 ws://0.0.0.0:8083")
    async with serve(handler, "0.0.0.0", 8083):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
