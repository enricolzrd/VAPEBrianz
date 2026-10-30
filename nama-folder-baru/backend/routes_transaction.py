from dependencies import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from database import get_db
from models import Product, Transaction, TransactionDetail 
from schemas import TransactionCreate


router = APIRouter(prefix="/api", tags=["Transactions"])

@router.post("/transactions")
def create_transaction(
    trx: TransactionCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user) # <--- Wajib tambahkan parameter ini
):
    invoice_number = f"VB-{datetime.now().strftime('%y%m%d-%H%M%S')}"
    
    subtotal = 0
    details_to_insert = []
    
    with db.begin():
        for item in trx.cart_items:
            product = db.get(Product, item.product_id)
            
            if not product:
                raise HTTPException(status_code=404, detail=f"Produk ID {item.product_id} tidak ditemukan")
                
            if product.stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Stok tidak cukup untuk produk ID {item.product_id}")
                
            price_at_transaction = product.price
            subtotal_item = price_at_transaction * item.quantity
            subtotal += subtotal_item
            
            product.stock -= item.quantity
            
            details_to_insert.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price_at_transaction": price_at_transaction,
                "subtotal_item": subtotal_item
            })

        total_amount = subtotal - trx.discount_amount

        # Pembuatan header transaksi
        new_transaction = Transaction(
            invoice_number=invoice_number,
            user_id=current_user["user_id"], # <--- Ubah trx.user_id menjadi current_user["user_id"]
            customer_name=trx.customer_name,
            subtotal=subtotal,
            discount_amount=trx.discount_amount,
            total_amount=total_amount,
            payment_method=trx.payment_method
        )
        db.add(new_transaction)
        db.flush() 

        for detail in details_to_insert:
            new_detail = TransactionDetail(
                transaction_id=new_transaction.id,
                product_id=detail["product_id"],
                quantity=detail["quantity"],
                price_at_transaction=detail["price_at_transaction"],
                subtotal_item=detail["subtotal_item"]
            )
            db.add(new_detail)

    return {
        "message": "Transaksi berhasil diproses!", 
        "invoice_number": invoice_number,
        "total_paid": total_amount
    }

@router.get("/transactions")
def get_transaction_history(db: Session = Depends(get_db)):
    # Menggunakan joinedload untuk mengambil data profil user sekaligus (seperti users(username) di Supabase)
    stmt = (
        select(Transaction)
        .options(joinedload(Transaction.user)) 
        .order_by(desc(Transaction.created_at))
    )
    transactions = db.scalars(stmt).all()
    return {"data": transactions}

@router.get("/transactions/{transaction_id}")
def get_transaction_details(transaction_id: int, db: Session = Depends(get_db)):
    # Menggunakan joinedload untuk menarik data nama produk dari item transaksi
    stmt = (
        select(TransactionDetail)
        .options(joinedload(TransactionDetail.product))
        .where(TransactionDetail.transaction_id == transaction_id)
    )
    details = db.scalars(stmt).all()
    
    if not details:
        raise HTTPException(status_code=404, detail="Detail transaksi tidak ditemukan")
        
    return {"data": details}
