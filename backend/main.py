from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# Model produk
class Product(BaseModel):
    name: str
    category: str
    price: float
    stock: int

# Data dummy
products = [
    {"id": 1, "name": "FOOM x", "category": "Pod", "price": 150000, "stock": 10},
    {"id": 2, "name": "Xros 5", "category": "Pod", "price": 300000, "stock": 25},
    {"id": 3, "name": "FADE Pistasio creme", "category": "Liquid", "price": 95000, "stock": 50},
    {"id": 4, "name": "DEAD Rabbit v3", "category": "RDA", "price": 320000, "stock": 8},
]

next_id = 5  

@app.get("/products")
def get_products():
    return products

@app.get("/products/{id}")
def get_product(id: int):
    for p in products:
        if p["id"] == id:
            return p
    raise HTTPException(status_code=404, detail="Produk tidak ditemukan")

@app.post("/products")
def create_product(product: Product):
    global next_id
    new = {"id": next_id, **product.dict()}
    products.append(new)
    next_id += 1
    return new

@app.put("/products/{id}")
def update_product(id: int, product: Product):
    for p in products:
        if p["id"] == id:
            p.update(product.dict())
            return p
    raise HTTPException(status_code=404, detail="Produk tidak ditemukan")

@app.delete("/products/{id}")
def delete_product(id: int):
    for p in products:
        if p["id"] == id:
            products.remove(p)
            return {"message": f"Produk '{p['name']}' berhasil dihapus"}
    raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
