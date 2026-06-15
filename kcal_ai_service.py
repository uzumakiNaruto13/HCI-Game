"""
卡路里AI助手服务 - 浏览器 → Python → 智谱GLM
运行: python kcal_ai_service.py  (端口 8083)
"""
import asyncio
import json
from datetime import datetime
from websockets import serve

API_KEY = "tp-c1avzwy5qc1yqhfqc7t2ie67b3pgpyc52ndpnlolm8ictb07"
API_URL = "https://token-plan-cn.xiaomimimo.com/v1/chat/completions"
MODEL = "mimo-v2.5"

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

                system_prompt = "你是居家健身AI教练「卡卡」，性格阳光鼓励型。分析用户运动数据给出50字内个性化建议。语气活泼，像朋友聊天。"
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
