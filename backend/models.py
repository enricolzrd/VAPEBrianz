from sqlalchemy import Column, Integer, String, Numeric, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

    # Relasi ke tabel products
    products = relationship("Product", back_populates="category")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    role = Column(Text, default="kasir")
    is_active = Column(Boolean, default=True)

    # Relasi ke tabel transactions
    transactions = relationship("Transaction", back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    name = Column(String, index=True)
    price = Column(Numeric)
    stock = Column(Integer)
    is_active = Column(Boolean, default=True)

    # Relasi balik ke Category dan maju ke TransactionDetail
    category = relationship("Category", back_populates="products")
    transaction_details = relationship("TransactionDetail", back_populates="product")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    customer_name = Column(String, nullable=True)
    subtotal = Column(Numeric)
    discount_amount = Column(Numeric)
    total_amount = Column(Numeric)
    payment_method = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relasi balik ke User dan maju ke TransactionDetail
    user = relationship("User", back_populates="transactions")
    details = relationship("TransactionDetail", back_populates="transaction")


class TransactionDetail(Base):
    __tablename__ = "transaction_details"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price_at_transaction = Column(Numeric)
    subtotal_item = Column(Numeric)

    # Relasi balik ke Transaction dan Product
    transaction = relationship("Transaction", back_populates="details")
    product = relationship("Product", back_populates="transaction_details")