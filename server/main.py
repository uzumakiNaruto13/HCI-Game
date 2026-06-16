"""居家健身游戏平台 - FastAPI 后端 (用户系统 + 数据API)"""
import json
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone

from server.database import engine, get_db, Base
from server.models import User, GameSession, Follow, ActivityFeed
from server.auth import hash_password, verify_password, create_access_token, get_current_user

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HCI-Game API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ==================== 请求模型 ====================

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class ProfileUpdate(BaseModel):
    weight: Optional[float] = None
    height: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    daily_goal: Optional[int] = None
    weekly_goal: Optional[int] = None

class SessionCreate(BaseModel):
    game_name: str
    kcal: float
    score: int = 0
    duration_sec: int = 0
    met: float = 4.0

# ==================== 响应模型 ====================

class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    weight: float
    height: float
    age: int
    gender: str
    daily_goal: int
    weekly_goal: int
    model_config = {"from_attributes": True}

class SessionResponse(BaseModel):
    id: int
    game_name: str
    kcal: float
    score: int
    duration_sec: int
    met: float
    date: str
    hour: int
    created_at: datetime
    model_config = {"from_attributes": True}

class ReportResponse(BaseModel):
    today_kcal: float
    today_count: int
    today_min: int
    week_kcal: float
    total_kcal: float
    total_min: int
    streak: int
    daily_pct: float
    weekly_pct: float
    game_breakdown: dict
    hourly: dict
    week_data: dict

# ==================== 用户认证 ====================

@app.post("/api/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(400, "用户名已存在")
    user = User(username=req.username, email=req.email, hashed_password=hash_password(req.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return {"token": token, "user": UserResponse.model_validate(user)}

@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(401, "用户名或密码错误")
    token = create_access_token({"sub": str(user.id)})
    return {"token": token, "user": UserResponse.model_validate(user)}

@app.get("/api/auth/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return user

@app.put("/api/auth/profile")
def update_profile(req: ProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.weight is not None: user.weight = req.weight
    if req.height is not None: user.height = req.height
    if req.age is not None: user.age = req.age
    if req.gender is not None: user.gender = req.gender
    if req.daily_goal is not None: user.daily_goal = req.daily_goal
    if req.weekly_goal is not None: user.weekly_goal = req.weekly_goal
    db.commit()
    return UserResponse.model_validate(user)

# ==================== 游戏数据 ====================

@app.post("/api/sessions")
def create_session(req: SessionCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    s = GameSession(
        user_id=user.id, game_name=req.game_name, kcal=req.kcal,
        score=req.score, duration_sec=req.duration_sec, met=req.met,
        date=now.strftime("%Y-%m-%d"), hour=now.hour
    )
    db.add(s)

    # 自动创建动态
    _add_activity(db, user.id, "game_played",
        f"完成了 {req.game_name}，消耗 {req.kcal:.1f} kcal，得分 {req.score}",
        json.dumps({"game": req.game_name, "kcal": req.kcal, "score": req.score}))

    # 检查是否达成每日/每周目标 (flush 确保新 session 可查)
    db.flush()
    today = now.strftime("%Y-%m-%d")
    today_sessions = db.query(GameSession).filter(
        GameSession.user_id == user.id, GameSession.date == today
    ).all()
    today_kcal = sum(s.kcal for s in today_sessions)

    if today_kcal >= user.daily_goal and today_kcal - req.kcal < user.daily_goal:
        _add_activity(db, user.id, "goal_achieved",
            f"达成今日目标 {user.daily_goal} kcal！({today_kcal:.0f} kcal)")

    db.commit()
    return {"ok": True}

@app.get("/api/sessions", response_model=List[SessionResponse])
def get_sessions(days: int = 30, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    month_start = datetime.now(timezone.utc).replace(day=1).strftime("%Y-%m-%d")
    sessions = db.query(GameSession).filter(
        GameSession.user_id == user.id,
        GameSession.date >= month_start
    ).order_by(GameSession.created_at.desc()).limit(days * 10).all()
    return sessions

@app.get("/api/report")
def get_report(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    week_start = datetime.now(timezone.utc)
    week_start = week_start.replace(day=week_start.day - week_start.weekday()).strftime("%Y-%m-%d")

    all_sessions = db.query(GameSession).filter(GameSession.user_id == user.id).all()
    today_sessions = [s for s in all_sessions if s.date == today]
    week_sessions = [s for s in all_sessions if s.date >= week_start]

    # 今日
    today_kcal = sum(s.kcal for s in today_sessions)
    today_count = len(today_sessions)
    today_min = sum(s.duration_sec for s in today_sessions) // 60

    # 本周
    week_kcal = sum(s.kcal for s in week_sessions)

    # 总计
    total_kcal = sum(s.kcal for s in all_sessions)
    total_min = sum(s.duration_sec for s in all_sessions) // 60

    # 游戏占比
    game_breakdown = {}
    for s in all_sessions:
        game_breakdown[s.game_name] = game_breakdown.get(s.game_name, 0) + s.kcal

    # 24h 数据
    hourly = {str(h): 0 for h in range(24)}
    for s in today_sessions:
        hourly[str(s.hour)] = hourly.get(str(s.hour), 0) + s.kcal

    # 7天趋势
    week_data = {}
    for i in range(6, -1, -1):
        d = datetime.now(timezone.utc)
        d = d.replace(day=d.day - i).strftime("%Y-%m-%d")
        week_data[d] = sum(s.kcal for s in all_sessions if s.date == d)

    # 连续打卡
    streak = _calc_user_streak(user.id, db)

    return ReportResponse(
        today_kcal=round(today_kcal, 1), today_count=today_count, today_min=today_min,
        week_kcal=round(week_kcal, 1), total_kcal=round(total_kcal, 1), total_min=total_min,
        streak=streak, daily_pct=round(today_kcal / user.daily_goal * 100, 1) if user.daily_goal else 0,
        weekly_pct=round(week_kcal / user.weekly_goal * 100, 1) if user.weekly_goal else 0,
        game_breakdown=game_breakdown, hourly=hourly, week_data=week_data
    )

# ==================== 数据同步 (localStorage → 服务器) ====================

class SyncSessionItem(BaseModel):
    game: str = ""
    game_name: str = ""
    kcal: float = 0
    score: int = 0
    duration: int = 0
    duration_sec: int = 0
    met: float = 4.0
    date: str = ""
    hour: int = 0

class SyncRequest(BaseModel):
    sessions: list[SyncSessionItem] = []
    total_kcal: float = 0

@app.post("/api/sync")
def sync_data(req: SyncRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """将本地 localStorage 数据批量迁移到服务器"""
    imported = 0
    now = datetime.now(timezone.utc)
    for s in req.sessions:
        game_name = s.game_name or s.game or "未知"
        duration_sec = s.duration_sec or s.duration or 0

        # 去重检查
        existing = db.query(GameSession).filter(
            GameSession.user_id == user.id,
            GameSession.game_name == game_name,
            GameSession.kcal == (s.kcal or 0),
            GameSession.score == (s.score or 0)
        ).first()
        if not existing:
            session = GameSession(
                user_id=user.id, game_name=game_name, kcal=s.kcal or 0,
                score=s.score or 0, duration_sec=duration_sec, met=s.met or 4.0,
                date=s.date or now.strftime("%Y-%m-%d"), hour=s.hour or now.hour
            )
            db.add(session)
            imported += 1

    db.commit()
    return {"ok": True, "imported": imported}


# ==================== 排行榜 (增强版) ====================

@app.get("/api/leaderboard")
def leaderboard(scope: str = "today", db: Session = Depends(get_db)):
    """排行榜: scope = today | week | all"""
    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")

    if scope == "week":
        week_start = now.replace(day=now.day - now.weekday()).strftime("%Y-%m-%d")
    else:
        week_start = "2000-01-01"

    users = db.query(User).all()
    ranks = []

    for u in users:
        query = db.query(GameSession).filter(GameSession.user_id == u.id)
        if scope == "today":
            query = query.filter(GameSession.date == today)
        elif scope == "week":
            sessions = query.all()
            sessions = [s for s in sessions if s.date >= week_start]
        else:
            sessions = query.all()

        if scope in ("today", "week"):
            kcal = round(sum(s.kcal for s in sessions), 1)
            count = len(sessions)
        else:
            sessions_list = query.all()
            kcal = round(sum(s.kcal for s in sessions_list), 1)
            count = len(sessions_list)

        if kcal > 0 or scope == "all":
            ranks.append({
                "username": u.username,
                "kcal": kcal,
                "sessions": count,
                "streak": _calc_user_streak(u.id, db)
            })

    ranks.sort(key=lambda x: x["kcal"], reverse=True)
    return ranks[:20]


def _calc_user_streak(user_id: int, db: Session) -> int:
    """计算用户连续打卡天数"""
    sessions = db.query(GameSession).filter(
        GameSession.user_id == user_id, GameSession.kcal > 0
    ).all()
    days_set = set(s.date for s in sessions)
    streak = 0
    check = datetime.now(timezone.utc)
    while check.strftime("%Y-%m-%d") in days_set:
        streak += 1
        check = check.replace(day=check.day - 1)
    return streak


# ==================== 社交: 关注系统 ====================

class FollowRequest(BaseModel):
    username: str

@app.post("/api/social/follow")
def follow_user(req: FollowRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """关注一个用户"""
    target = db.query(User).filter(User.username == req.username).first()
    if not target:
        raise HTTPException(404, "用户不存在")
    if target.id == user.id:
        raise HTTPException(400, "不能关注自己")
    existing = db.query(Follow).filter(
        Follow.follower_id == user.id, Follow.followed_id == target.id
    ).first()
    if existing:
        raise HTTPException(400, "已关注该用户")
    follow = Follow(follower_id=user.id, followed_id=target.id)
    db.add(follow)
    # 添加动态
    _add_activity(db, user.id, "followed", f"关注了 {target.username}")
    db.commit()
    return {"ok": True, "following": target.username}


@app.delete("/api/social/follow")
def unfollow_user(req: FollowRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """取消关注"""
    target = db.query(User).filter(User.username == req.username).first()
    if not target:
        raise HTTPException(404, "用户不存在")
    follow = db.query(Follow).filter(
        Follow.follower_id == user.id, Follow.followed_id == target.id
    ).first()
    if not follow:
        raise HTTPException(404, "未关注该用户")
    db.delete(follow)
    db.commit()
    return {"ok": True, "unfollowed": target.username}


@app.get("/api/social/friends")
def get_friends(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取好友列表 (我关注的 + 关注我的)"""
    following = db.query(Follow).filter(Follow.follower_id == user.id).all()
    followers = db.query(Follow).filter(Follow.followed_id == user.id).all()

    following_users = []
    for f in following:
        u = db.query(User).filter(User.id == f.followed_id).first()
        if u:
            # 获取今日数据
            today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            today_sessions = db.query(GameSession).filter(
                GameSession.user_id == u.id, GameSession.date == today
            ).all()
            today_kcal = round(sum(s.kcal for s in today_sessions), 1)
            following_users.append({
                "username": u.username,
                "today_kcal": today_kcal,
                "streak": _calc_user_streak(u.id, db),
                "is_mutual": any(f2.follower_id == u.id and f2.followed_id == user.id for f2 in followers)
            })

    follower_users = []
    for f in followers:
        u = db.query(User).filter(User.id == f.follower_id).first()
        if u:
            follower_users.append({"username": u.username})

    return {
        "following": following_users,
        "followers": follower_users,
        "following_count": len(following_users),
        "follower_count": len(follower_users)
    }


# ==================== 社交: 好友动态 ====================

@app.get("/api/social/feed")
def get_feed(limit: int = 30, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取好友动态 (我关注的 + 我自己的)"""
    # 我关注的人
    following_ids = [
        f.followed_id for f in db.query(Follow).filter(Follow.follower_id == user.id).all()
    ]
    # 包括自己
    visible_ids = following_ids + [user.id]

    feeds = db.query(ActivityFeed).filter(
        ActivityFeed.user_id.in_(visible_ids)
    ).order_by(ActivityFeed.created_at.desc()).limit(limit).all()

    result = []
    for f in feeds:
        u = db.query(User).filter(User.id == f.user_id).first()
        result.append({
            "username": u.username if u else "unknown",
            "activity_type": f.activity_type,
            "content": f.content,
            "metadata_json": f.metadata_json,
            "created_at": f.created_at.isoformat()
        })
    return result


def _add_activity(db: Session, user_id: int, activity_type: str, content: str, metadata_json: str = None):
    """添加一条动态 (内部辅助)"""
    act = ActivityFeed(
        user_id=user_id,
        activity_type=activity_type,
        content=content,
        metadata_json=metadata_json
    )
    db.add(act)
