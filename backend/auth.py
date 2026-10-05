import os
import bcrypt
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import HTTPException, Request

# ==========================================
# KONFIGURASI JWT
# ==========================================
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "vapebrianz-super-secret-jwt-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 8  # Token berlaku 8 jam


# ==========================================
# FUNGSI PASSWORD
# ==========================================
def hash_password(plain_password: str) -> str:
    """Hash password sebelum disimpan ke database."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifikasi password input vs hash di database."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


# ==========================================
# FUNGSI JWT TOKEN
# ==========================================
def create_access_token(data: dict) -> str:
    """Buat JWT token dengan data user + waktu expired."""
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode dan validasi JWT token. Raise exception jika tidak valid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Token tidak valid atau sudah expired")


def get_token_from_request(request: Request) -> str | None:
    """Ambil token dari header Authorization: Bearer <token>."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ")[1]
