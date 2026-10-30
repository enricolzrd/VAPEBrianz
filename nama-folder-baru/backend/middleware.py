import time
import logging
import os
from datetime import datetime
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from auth import decode_access_token, get_token_from_request

# ==========================================
# KONFIGURASI LOGGING
# ==========================================
os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[
        logging.FileHandler("logs/activity.log", encoding="utf-8"),
        logging.StreamHandler(),  # juga tampil di terminal
    ],
)
logger = logging.getLogger("vapebrianz")

# ==========================================
# ENDPOINT YANG TIDAK PERLU TOKEN (Public)
# ==========================================
PUBLIC_ROUTES = [
    "/api/auth/login",
    "/api/auth/register",
    "/docs",
    "/openapi.json",
    "/redoc",
]


# ==========================================
# 1. LOGGING MIDDLEWARE
# ==========================================
class LoggingMiddleware(BaseHTTPMiddleware):
    """Catat setiap request yang masuk: method, URL, status, durasi."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        waktu = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        response = await call_next(request)

        durasi_ms = round((time.time() - start_time) * 1000)
        status = response.status_code
        method = request.method
        url = request.url.path
        ip = request.client.host if request.client else "unknown"

        # Format log: [waktu] METHOD /path STATUS Xms IP
        status_icon = "✓" if status < 400 else "✗"
        logger.info(
            f"[{waktu}] {method:<7} {url:<35} {status} {durasi_ms}ms {status_icon} | IP: {ip}"
        )

        return response


# ==========================================
# 2. AUTH MIDDLEWARE
# ==========================================
class AuthMiddleware(BaseHTTPMiddleware):
    """Cek JWT token di setiap request. Kecualikan public routes."""

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Lewati pengecekan untuk public routes
        if any(path.startswith(pub) for pub in PUBLIC_ROUTES):
            return await call_next(request)

        # Ambil token dari header
        token = get_token_from_request(request)

        if not token:
            logger.warning(f"[AUTH] DITOLAK - Tidak ada token | {request.method} {path}")
            return JSONResponse(
                status_code=401,
                content={"detail": "Akses ditolak. Silakan login terlebih dahulu."},
            )

        # Validasi token
        try:
            payload = decode_access_token(token)
            # Sisipkan data user ke request state agar bisa diakses di endpoint
            request.state.user = payload
        except Exception:
            logger.warning(f"[AUTH] DITOLAK - Token tidak valid | {request.method} {path}")
            return JSONResponse(
                status_code=401,
                content={"detail": "Token tidak valid atau sudah expired. Silakan login ulang."},
            )

        return await call_next(request)
