import os
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv(override=True)

security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "vapebrianz-super-secret-jwt-key-2026")
ALGORITHM = "HS256"

# Middleware JWT: Membaca dan memvalidasi token
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        role: str = payload.get("role")
        user_id: int = payload.get("user_id")
        
        if username is None or user_id is None:
            raise HTTPException(status_code=401, detail="Format token tidak valid atau tidak lengkap.")
            
        return {"username": username, "role": role, "user_id": user_id}
    except JWTError:
        raise HTTPException(status_code=401, detail="Token kadaluarsa atau tidak valid.")

# Middleware RBAC: Memblokir akses selain Admin
def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Akses ditolak. Fitur ini hanya untuk Admin.")
    return current_user