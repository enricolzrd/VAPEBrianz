from sqlalchemy import Column, Integer, String, Boolean, Text
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    role = Column(Text, default="kasir")
    is_active = Column(Boolean, default=True)