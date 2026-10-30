from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import LoginRequest, RegisterRequest
from auth import verify_password, create_access_token, get_password_hash 
from dependencies import require_admin

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    # Cari user menggunakan SQLAlchemy
    user = db.query(User).filter(User.username == body.username).first()

    if not user:
        raise HTTPException(status_code=401, detail="Username atau password salah")

    # Pastikan atribut sesuai dengan penamaan di models.py
    stored_password = user.password_hash
    
    if not stored_password:
        raise HTTPException(status_code=401, detail="Username atau password salah")

    if not verify_password(body.password, stored_password):
        raise HTTPException(status_code=401, detail="Username atau password salah")

    if user.is_active is False:
        raise HTTPException(status_code=403, detail="Akun tidak aktif. Hubungi administrator.")

    token = create_access_token({
        "user_id": user.id,
        "username": user.username,
        "role": user.role or "kasir",
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role or "kasir",
    }

@router.get("/users")
def get_users(db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    users = db.query(User).order_by(User.id).all()
    return {
        "data": [
            {
                "id": u.id,
                "username": u.username,
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active,
            }
            for u in users
        ]
    }


@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    # Cek username ganda menggunakan SQLAlchemy
    existing_user = db.query(User).filter(User.username == body.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username sudah terdaftar. Silakan gunakan username lain.")

    hashed_pwd = get_password_hash(body.password)

    # Siapkan data menggunakan class Model
    new_user = User(
        username=body.username,
        password_hash=hashed_pwd,
        role=body.role,
        is_active=True,
        name=body.name,
        email=body.email
    )

    # Masukkan ke database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registrasi kasir baru berhasil!", 
        "username": new_user.username,
        "role": new_user.role
    }