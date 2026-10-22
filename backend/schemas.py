from typing import List, Optional
from pydantic import BaseModel

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

class LoginRequest(BaseModel):
    username: str
    password: str

# Tambahan model untuk fitur Register baru
class RegisterRequest(BaseModel):
    username: str
    password: str
    role: Optional[str] = "kasir"