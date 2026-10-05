"""
Script diagnosa login — jalankan dengan: python diagnosa.py
"""
import os
from dotenv import load_dotenv
from supabase import create_client
from auth import hash_password, verify_password

load_dotenv(override=True)
sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

print("=" * 55)
print("DIAGNOSA LOGIN VAPEBRIANZ")
print("=" * 55)

# 1. Cek isi tabel users — tampilkan SEMUA kolom apa adanya
print("\n[1] Data mentah tabel users:")
res = sb.table("users").select("*").execute()

if not res.data:
    print("  ❌ Tabel users KOSONG!")
else:
    user = res.data[0]
    print(f"  Kolom yang ada: {list(user.keys())}")
    for k, v in user.items():
        val = str(v)[:60] if v else "KOSONG"
        print(f"    {k}: {val}")

    # 2. Cari kolom password apapun namanya
    print("\n[2] Cek kolom password:")
    password_col = None
    for col in ["password", "password_hash", "pass", "pwd", "hashed_password"]:
        if col in user and user[col]:
            password_col = col
            print(f"  ✅ Ditemukan di kolom: '{col}'")
            print(f"     Nilai: {str(user[col])[:50]}...")
            break

    if not password_col:
        print("  ❌ Tidak ada kolom password yang terisi!")
        print(f"     Semua kolom: {list(user.keys())}")
    else:
        # 3. Verifikasi password
        print(f"\n[3] Test verifikasi password 'brian123':")
        if verify_password("brian123", user[password_col]):
            print("  ✅ PASSWORD COCOK — Login seharusnya berhasil!")
        else:
            print("  ❌ Password tidak cocok dengan hash di database.")
            print(f"     Hash baru untuk 'brian123':")
            print(f"     {hash_password('brian123')}")

print("\n" + "=" * 55)
