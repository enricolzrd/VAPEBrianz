from fastapi import APIRouter, HTTPException
from datetime import datetime
from database import supabase
from schemas import TransactionCreate

router = APIRouter(prefix="/api", tags=["Transactions"])

@router.post("/transactions")
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

@router.get("/transactions")
def get_transaction_history():
    response = supabase.table("transactions").select("*, users(username)").order("created_at", desc=True).execute()
    return {"data": response.data}

@router.get("/transactions/{transaction_id}")
def get_transaction_details(transaction_id: int):
    response = supabase.table("transaction_details").select("*, products(name)").eq("transaction_id", transaction_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Detail transaksi tidak ditemukan")
        
    return {"data": response.data}