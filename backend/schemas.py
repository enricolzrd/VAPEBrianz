from typing import List, Optional
from pydantic import BaseModel
from decimal import Decimal

class ProductCreate(BaseModel):
    category_id: int
    name: str
    price: float
    stock: int

class CartItem(BaseModel):
    product_id: int
    quantity: int

class TransactionCreate(BaseModel):
    customer_name: Optional[str] = None
    discount_amount: Decimal = Decimal("0") # Beri default 0 agar tidak wajib diisi jika tidak ada diskon
    payment_method: str
    cart_items: List[CartItem]

class CategoryCreate(BaseModel):
    name: str

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[float] = None
    stock: Optional[int] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    role: Optional[str] = "kasir"
    name: Optional[str] = None
    email: Optional[str] = None