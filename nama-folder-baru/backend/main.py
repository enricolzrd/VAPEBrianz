from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import middleware dari file buatan teman Anda
from middleware import LoggingMiddleware

# Import router yang sudah kita pecah
import routes_auth
import routes_master
import routes_transaction

app = FastAPI(title="VapeBrianz API")

# Urutan Middleware: Logging (Dalam) -> Auth (Tengah) -> CORS (Terluar)
app.add_middleware(LoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan semua router ke aplikasi utama
app.include_router(routes_auth.router)
app.include_router(routes_master.router)
app.include_router(routes_transaction.router)