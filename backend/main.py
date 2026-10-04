import os
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from pydantic import BaseModel

# Load file .env
load_dotenv(override=True)

app = FastAPI(title="VapeBrianz API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("Cek URL: ", SUPABASE_URL)
print("Cek KEY: ", SUPABASE_KEY[:30] if SUPABASE_KEY else "KOSONG / GAGAL BACA .ENV!")
# -------------------------------

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ==========================================
# 1. SKEMA DATA (PYDANTIC MODELS)
# ==========================================
class ProductCreate(BaseModel):
    category_id: int
    name: str
    price: float
    stock: int

class CartItem(BaseModel):
    product_id: int
    quantity: int

class TransactionCreate(BaseModel):
    user_id: int = 1  # Default Kasir (ID 1 = brian)
    customer_name: Optional[str] = None
    discount_amount: float = 0
    payment_method: str
    cart_items: List[CartItem]

class CategoryCreate(BaseModel):
    name: str

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[float] = None
    stock: Optional[int] = None

# ==========================================
# 2. ENDPOINTS MASTER DATA
# ==========================================
@app.get("/api/categories")
def get_categories():
    response = supabase.table("categories").select("*").execute()
    return {"data": response.data}

@app.post("/api/categories")
def create_category(category: CategoryCreate):
    response = supabase.table("categories").insert(category.model_dump()).execute()
    return {"message": "Kategori berhasil ditambahkan", "data": response.data}

@app.put("/api/categories/{category_id}")
def update_category(category_id: int, category: CategoryCreate):
    response = supabase.table("categories").update(category.model_dump()).eq("id", category_id).execute()
    return {"message": "Kategori berhasil diupdate", "data": response.data}

@app.delete("/api/categories/{category_id}")
def delete_category(category_id: int):
    response = supabase.table("categories").delete().eq("id", category_id).execute()
    return {"message": "Kategori berhasil dihapus"}

@app.get("/api/products")
def get_products():
    response = supabase.table("products").select("*, categories(name)").eq("is_active", True).execute()
    return {"data": response.data}

@app.post("/api/products")
def create_product(product: ProductCreate):
    response = supabase.table("products").insert(product.model_dump()).execute()
    return {"message": "Produk berhasil ditambahkan", "data": response.data}

@app.put("/api/products/{product_id}")
def update_product(product_id: int, product: ProductUpdate):
    update_data = product.model_dump(exclude_unset=True) 
    response = supabase.table("products").update(update_data).eq("id", product_id).execute()
    return {"message": "Data produk berhasil diupdate", "data": response.data}

@app.delete("/api/products/{product_id}")
def delete_product(product_id: int):
    response = supabase.table("products").update({"is_active": False}).eq("id", product_id).execute()
    return {"message": "Produk berhasil dinonaktifkan (Soft Delete)", "data": response.data}

# ==========================================
# 3. ENDPOINT KASIR (TRANSAKSI)
# ==========================================
@app.post("/api/transactions")
def create_transaction(trx: TransactionCreate):
    invoice_number = f"VB-{datetime.now().strftime('%y%m%d-%H%M%S')}"
    
    subtotal = 0
    details_to_insert = []
    
    for item in trx.cart_items:
        prod_res = supabase.table("products").select("price, stock").eq("id", item.product_id).execute()
        
        if not prod_res.data:
            raise HTTPException(status_code=404, detail=f"Produk ID {item.product_id} tidak ditemukan")
            
        prod_data = prod_res.data[0]
        if prod_data["stock"] < item.quantity:
            raise HTTPException(status_code=400, detail=f"Stok tidak cukup untuk produk ID {item.product_id}")
            
        price_at_transaction = prod_data["price"]
        subtotal_item = price_at_transaction * item.quantity
        subtotal += subtotal_item
        
        details_to_insert.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price_at_transaction": price_at_transaction,
            "subtotal_item": subtotal_item
        })

    total_amount = subtotal - trx.discount_amount

    trx_data = {
        "invoice_number": invoice_number,
        "user_id": trx.user_id,
        "customer_name": trx.customer_name,
        "subtotal": subtotal,
        "discount_amount": trx.discount_amount,
        "total_amount": total_amount,
        "payment_method": trx.payment_method
    }
    trx_res = supabase.table("transactions").insert(trx_data).execute()
    new_trx_id = trx_res.data[0]["id"]

    for detail in details_to_insert:
        detail["transaction_id"] = new_trx_id
        supabase.table("transaction_details").insert(detail).execute()
        
        old_stock_res = supabase.table("products").select("stock").eq("id", detail["product_id"]).execute()
        new_stock = old_stock_res.data[0]["stock"] - detail["quantity"]
        supabase.table("products").update({"stock": new_stock}).eq("id", detail["product_id"]).execute()

    return {
        "message": "Transaksi berhasil diproses!", 
        "invoice_number": invoice_number,
        "total_paid": total_amount
    }

@app.get("/api/transactions")
def get_transaction_history():
    response = supabase.table("transactions").select("*, users(username)").order("created_at", desc=True).execute()
    return {"data": response.data}

@app.get("/api/transactions/{transaction_id}")
def get_transaction_details(transaction_id: int):
    response = supabase.table("transaction_details").select("*, products(name)").eq("transaction_id", transaction_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Detail transaksi tidak ditemukan")
        
    return {"data": response.data}