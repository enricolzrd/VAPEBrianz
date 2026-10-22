from fastapi import APIRouter
from database import supabase
from schemas import CategoryCreate, ProductCreate, ProductUpdate

router = APIRouter(prefix="/api", tags=["Master Data"])

@router.get("/categories")
def get_categories():
    response = supabase.table("categories").select("*").execute()
    return {"data": response.data}

@router.post("/categories")
def create_category(category: CategoryCreate):
    response = supabase.table("categories").insert(category.model_dump()).execute()
    return {"message": "Kategori berhasil ditambahkan", "data": response.data}

@router.put("/categories/{category_id}")
def update_category(category_id: int, category: CategoryCreate):
    response = supabase.table("categories").update(category.model_dump()).eq("id", category_id).execute()
    return {"message": "Kategori berhasil diupdate", "data": response.data}

@router.delete("/categories/{category_id}")
def delete_category(category_id: int):
    response = supabase.table("categories").delete().eq("id", category_id).execute()
    return {"message": "Kategori berhasil dihapus"}

@router.get("/products")
def get_products():
    response = supabase.table("products").select("*, categories(name)").eq("is_active", True).execute()
    return {"data": response.data}

@router.post("/products")
def create_product(product: ProductCreate):
    response = supabase.table("products").insert(product.model_dump()).execute()
    return {"message": "Produk berhasil ditambahkan", "data": response.data}

@router.put("/products/{product_id}")
def update_product(product_id: int, product: ProductUpdate):
    update_data = product.model_dump(exclude_unset=True) 
    response = supabase.table("products").update(update_data).eq("id", product_id).execute()
    return {"message": "Data produk berhasil diupdate", "data": response.data}

@router.delete("/products/{product_id}")
def delete_product(product_id: int):
    response = supabase.table("products").update({"is_active": False}).eq("id", product_id).execute()
    return {"message": "Produk berhasil dinonaktifkan (Soft Delete)", "data": response.data}