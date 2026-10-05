from dotenv import load_dotenv
from supabase import create_client
import os

load_dotenv(override=True)
sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

print("=" * 55)
print("CEK TABEL DATABASE SUPABASE - VAPEBRIANZ")
print("=" * 55)

tables = ["users", "categories", "products", "transactions", "transaction_details"]

for table in tables:
    try:
        res = sb.table(table).select("*").limit(2).execute()
        kolom = list(res.data[0].keys()) if res.data else []
        jumlah = len(res.data)
        print(f"\n[ADA] Tabel: {table}")
        print(f"  Kolom  : {kolom}")
        print(f"  Data   : {jumlah} baris (sample)")
    except Exception as e:
        print(f"\n[TIDAK ADA] Tabel: {table}")
        print(f"  Error  : {str(e)[:80]}")

print("\n" + "=" * 55)
