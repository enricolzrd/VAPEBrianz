from fastapi import APIRouter, HTTPException
from database import supabase
from schemas import LoginRequest, RegisterRequest

# Pastikan get_password_hash sudah ditambahkan di auth.py milik teman Anda!
from auth import verify_password, create_access_token, get_password_hash 

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login")
def login(body: LoginRequest):
    res = supabase.table("users").select("*").eq("username", body.username).execute()

    if not res.data:
        raise HTTPException(status_code=401, detail="Username atau password salah")

    user = res.data[0]
    stored_password = user.get("password") or user.get("password_hash")
    
    if not stored_password:
        raise HTTPException(status_code=401, detail="Username atau password salah")

    if not verify_password(body.password, stored_password):
        raise HTTPException(status_code=401, detail="Username atau password salah")

    if user.get("is_active") is False:
        raise HTTPException(status_code=403, detail="Akun tidak aktif. Hubungi administrator.")

    token = create_access_token({
        "user_id": user["id"],
        "username": user["username"],
        "role": user.get("role", "kasir"),
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user["username"],
        "role": user.get("role", "kasir"),
    }

@router.post("/register")
def register(body: RegisterRequest):
    existing_user = supabase.table("users").select("id").eq("username", body.username).execute()
    if existing_user.data:
        raise HTTPException(status_code=400, detail="Username sudah terdaftar. Silakan gunakan username lain.")

    hashed_pwd = get_password_hash(body.password)

    new_user = {
        "username": body.username,
        "password_hash": hashed_pwd,
        "role": body.role,
        "is_active": True,
        "name": None,       # Kirim None secara eksplisit
        "email": None       # Kirim None secara eksplisit
    }

    res = supabase.table("users").insert(new_user).execute()

    return {
        "message": "Registrasi kasir baru berhasil!", 
        "username": body.username,
        "role": body.role
    }