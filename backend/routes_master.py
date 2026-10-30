from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, Update
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Category, Product  # Pastikan relasi sudah didefinisikan di models.py
from schemas import CategoryCreate, ProductCreate, ProductUpdate


router = APIRouter(prefix="/api", tags=["Master Data"])

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.scalars(select(Category)).all()
    return {"data": categories}

@router.post("/categories")
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    new_category = Category(**category.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return {"message": "Kategori berhasil ditambahkan", "data": new_category}

@router.put("/categories/{category_id}")
def update_category(category_id: int, category: CategoryCreate, db: Session = Depends(get_db)):
    # Mencari data kategori terlebih dahulu
    db_category = db.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    
    # Update data menggunakan perulangan atribut objek
    for key, value in category.model_dump().items():
        setattr(db_category, key, value)
        
    db.commit()
    db.refresh(db_category)
    return {"message": "Kategori berhasil diupdate", "data": db_category}

@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    db_category = db.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    
    db.delete(db_category)
    db.commit()
    return {"message": "Kategori berhasil dihapus"}

# ==========================================
# PRODUCTS ENDPOINTS
# ==========================================

@router.get("/products")
def get_products(db: Session = Depends(get_db)):
    # Menggunakan joinedload untuk eager loading relasi kategori seperti halnya `*, categories(name)` di Supabase
    stmt = (
        select(Product)
        .options(joinedload(Product.category))
        .where(Product.is_active == True)
    )
    products = db.scalars(stmt).all()
    return {"data": products}

@router.post("/products")
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    new_product = Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {"message": "Produk berhasil ditambahkan", "data": new_product}

@router.put("/products/{product_id}")
def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db)):
    db_product = db.get(Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    
    update_data = product.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return {"message": "Data produk berhasil diupdate", "data": db_product}

@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.get(Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    
    # Soft Delete: Mengubah properti is_active menjadi False
    db_product.is_active = False
    db.commit()
    db.refresh(db_product)
    return {"message": "Produk berhasil dinonaktifkan (Soft Delete)", "data": db_product}
