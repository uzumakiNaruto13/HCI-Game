"""数据模型"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from server.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(200), nullable=False)
    weight = Column(Float, default=70.0)
    height = Column(Float, default=175.0)
    age = Column(Integer, default=25)
    gender = Column(String(10), default="male")
    daily_goal = Column(Integer, default=100)
    weekly_goal = Column(Integer, default=500)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    sessions = relationship("GameSession", back_populates="user", cascade="all, delete-orphan")
    # 社交: 我关注的人
    following = relationship("Follow", foreign_keys="Follow.follower_id", back_populates="follower", cascade="all, delete-orphan")
    # 社交: 关注我的人
    followers = relationship("Follow", foreign_keys="Follow.followed_id", back_populates="followed", cascade="all, delete-orphan")

class GameSession(Base):
    __tablename__ = "game_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_name = Column(String(50), nullable=False)
    kcal = Column(Float, default=0)
    score = Column(Integer, default=0)
    duration_sec = Column(Integer, default=0)
    met = Column(Float, default=4.0)
    date = Column(String(10), nullable=False)
    hour = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user = relationship("User", back_populates="sessions")

class Follow(Base):
    """关注关系: follower 关注 followed"""
    __tablename__ = "follows"
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    followed_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    follower = relationship("User", foreign_keys=[follower_id], back_populates="following")
    followed = relationship("User", foreign_keys=[followed_id], back_populates="followers")

class ActivityFeed(Base):
    """好友动态"""
    __tablename__ = "activity_feeds"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type = Column(String(30), nullable=False)  # game_played, goal_achieved, streak_milestone
    content = Column(Text, nullable=False)  # 动态内容
    metadata_json = Column(Text)  # JSON: {kcal, game, score, ...}
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user = relationship("User")
