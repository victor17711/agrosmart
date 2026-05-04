"""Seed script for AgroSmart database.

Creates an admin user, a set of agriculture-related categories and some
sample products so the app is usable out of the box.
Safe to run multiple times — it only inserts data when it's missing.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from auth_utils import get_password_hash
from models import User, Category, Product, Brand
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

ADMIN_EMAIL = "admin@agrosmart.md"
ADMIN_PASSWORD = "admin123"


async def seed_database():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]

    print(f"Seeding database `{os.environ['DB_NAME']}`...")

    # --- Admin user ------------------------------------------------------
    admin = await db.users.find_one({"email": ADMIN_EMAIL})
    if not admin:
        admin_user = User(
            email=ADMIN_EMAIL,
            firstName="Admin",
            lastName="AgroSmart",
            role="admin",
        )
        admin_dict = admin_user.dict()
        admin_dict["password"] = get_password_hash(ADMIN_PASSWORD)
        await db.users.insert_one(admin_dict)
        print(f"✓ Admin user created ({ADMIN_EMAIL} / {ADMIN_PASSWORD})")
    else:
        print(f"✓ Admin user already exists ({ADMIN_EMAIL})")

    # --- Categories (agriculture-focused) --------------------------------
    categories_data = [
        {"name": "Semințe", "nameRu": "Семена", "slug": "seminte", "icon": "🌱"},
        {"name": "Îngrășăminte", "nameRu": "Удобрения", "slug": "ingrasaminte", "icon": "🧪"},
        {"name": "Pesticide & Erbicide", "nameRu": "Пестициды", "slug": "pesticide", "icon": "🧴"},
        {"name": "Unelte de grădină", "nameRu": "Садовый инвентарь", "slug": "unelte-gradina", "icon": "🛠️"},
        {"name": "Irigare", "nameRu": "Полив", "slug": "irigare", "icon": "💧"},
        {"name": "Utilaje agricole", "nameRu": "Сельхозтехника", "slug": "utilaje", "icon": "🚜"},
    ]
    for cat_data in categories_data:
        exists = await db.categories.find_one({"slug": cat_data["slug"]})
        if not exists:
            category = Category(**cat_data)
            await db.categories.insert_one(category.dict())
    print(f"✓ {len(categories_data)} categories ensured")

    # --- Brands ----------------------------------------------------------
    brands_data = [
        {"name": "AgroMaster", "description": "Semințe certificate și hibrizi de înaltă producție"},
        {"name": "BioPlant", "description": "Produse bio pentru agricultură sustenabilă"},
        {"name": "GreenFarm", "description": "Soluții complete pentru ferme mici și medii"},
        {"name": "TerraPro", "description": "Utilaje și unelte profesionale"},
    ]
    brand_ids_by_name = {}
    for b in brands_data:
        existing = await db.brands.find_one({"name": b["name"]})
        if not existing:
            brand = Brand(**b)
            await db.brands.insert_one(brand.dict())
            brand_ids_by_name[b["name"]] = brand.id
        else:
            brand_ids_by_name[b["name"]] = existing["id"]
    print(f"✓ {len(brands_data)} brands ensured")

    # --- Products --------------------------------------------------------
    products_data = [
        {
            "name": "Semințe Porumb Hibrid PR37N01",
            "nameRu": "Семена кукурузы PR37N01",
            "description": "Hibrid de porumb cu productivitate ridicată, rezistent la secetă. Sac 50.000 boabe.",
            "price": 189.0,
            "originalPrice": 219.0,
            "discount": 14,
            "category": "Semințe",
            "storeName": "AgroMaster",
            "brandId": brand_ids_by_name.get("AgroMaster"),
            "image": "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600",
            "badge": "POPULAR",
        },
        {
            "name": "Semințe Floarea-Soarelui NK Neoma",
            "nameRu": "Семена подсолнечника",
            "description": "Hibrid performant pentru ulei, toleranță la Clearfield.",
            "price": 760.0,
            "originalPrice": 820.0,
            "discount": 7,
            "category": "Semințe",
            "storeName": "AgroMaster",
            "brandId": brand_ids_by_name.get("AgroMaster"),
            "image": "https://images.unsplash.com/photo-1534353341328-26a7cfdf9ef0?w=600",
            "badge": "TOP",
        },
        {
            "name": "Îngrășământ NPK 16-16-16",
            "nameRu": "Удобрение НПК 16-16-16",
            "description": "Complex granulat echilibrat pentru culturi de câmp. Sac 50 kg.",
            "price": 540.0,
            "originalPrice": 590.0,
            "discount": 8,
            "category": "Îngrășăminte",
            "storeName": "BioPlant",
            "brandId": brand_ids_by_name.get("BioPlant"),
            "image": "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600",
            "badge": "SALE",
        },
        {
            "name": "Îngrășământ Foliar BIO 5L",
            "nameRu": "Листовое удобрение БИО 5Л",
            "description": "Stimulator de creștere bio pentru aplicare foliară. Canistră 5L.",
            "price": 245.0,
            "category": "Îngrășăminte",
            "storeName": "BioPlant",
            "brandId": brand_ids_by_name.get("BioPlant"),
            "image": "https://images.unsplash.com/photo-1622383202480-fde02d0e8bfb?w=600",
            "badge": "BIO",
        },
        {
            "name": "Erbicid Roundup 5L",
            "nameRu": "Гербицид Roundup 5Л",
            "description": "Erbicid sistemic total pentru buruieni anuale și perene.",
            "price": 890.0,
            "originalPrice": 950.0,
            "discount": 6,
            "category": "Pesticide & Erbicide",
            "storeName": "GreenFarm",
            "brandId": brand_ids_by_name.get("GreenFarm"),
            "image": "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=600",
        },
        {
            "name": "Insecticid Karate Zeon 1L",
            "nameRu": "Инсектицид Karate Zeon 1Л",
            "description": "Insecticid piretroid cu spectru larg de acțiune.",
            "price": 460.0,
            "category": "Pesticide & Erbicide",
            "storeName": "GreenFarm",
            "brandId": brand_ids_by_name.get("GreenFarm"),
            "image": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600",
        },
        {
            "name": "Sapă ergonomică Fiskars",
            "nameRu": "Мотыга Fiskars",
            "description": "Sapă ușoară cu coadă din aluminiu, lamă din oțel călit.",
            "price": 420.0,
            "originalPrice": 480.0,
            "discount": 12,
            "category": "Unelte de grădină",
            "storeName": "TerraPro",
            "brandId": brand_ids_by_name.get("TerraPro"),
            "image": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600",
        },
        {
            "name": "Motocositoare Stihl FS 55",
            "nameRu": "Мотокоса Stihl FS 55",
            "description": "Motocositoare 27.2 cc, 0.75 kW, pentru întreținere curți și livezi.",
            "price": 5490.0,
            "originalPrice": 5990.0,
            "discount": 8,
            "category": "Unelte de grădină",
            "storeName": "TerraPro",
            "brandId": brand_ids_by_name.get("TerraPro"),
            "image": "https://images.unsplash.com/photo-1598902108854-10e335adac99?w=600",
            "badge": "NEW",
        },
        {
            "name": "Kit irigare prin picurare 100m",
            "nameRu": "Комплект капельного полива 100м",
            "description": "Set complet de picurare pentru grădina de legume.",
            "price": 690.0,
            "category": "Irigare",
            "storeName": "GreenFarm",
            "brandId": brand_ids_by_name.get("GreenFarm"),
            "image": "https://images.unsplash.com/photo-1585314540237-13cb52ca0123?w=600",
            "badge": "SALE",
        },
        {
            "name": "Furtun grădină 25m premium",
            "nameRu": "Садовый шланг 25м",
            "description": "Furtun armat cu 3 straturi, rezistent la presiune.",
            "price": 320.0,
            "category": "Irigare",
            "storeName": "TerraPro",
            "brandId": brand_ids_by_name.get("TerraPro"),
            "image": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600",
        },
        {
            "name": "Pulverizator 16L electric",
            "nameRu": "Опрыскиватель 16Л",
            "description": "Pulverizator cu acumulator pentru tratamente fitosanitare.",
            "price": 1290.0,
            "originalPrice": 1490.0,
            "discount": 13,
            "category": "Utilaje agricole",
            "storeName": "TerraPro",
            "brandId": brand_ids_by_name.get("TerraPro"),
            "image": "https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?w=600",
        },
        {
            "name": "Remorcă agricolă 3T",
            "nameRu": "Прицеп 3Т",
            "description": "Remorcă basculantă pentru tractor, capacitate 3 tone.",
            "price": 42000.0,
            "category": "Utilaje agricole",
            "storeName": "TerraPro",
            "brandId": brand_ids_by_name.get("TerraPro"),
            "image": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600",
            "badge": "PRO",
        },
    ]

    existing_products = await db.products.count_documents({})
    if existing_products == 0:
        all_products = []
        for p in products_data:
            prod = Product(**{
                **p,
                "rating": 4.6,
                "reviews": 0,
                "sold": 0,
                "available": 100,
                "inStock": True,
            })
            # Auto slug
            slug_base = (
                prod.name.lower()
                .replace(" ", "-")
                .replace("ă", "a").replace("â", "a").replace("î", "i")
                .replace("ș", "s").replace("ț", "t")
            )
            pd = prod.dict()
            pd["slug"] = slug_base
            all_products.append(pd)
        await db.products.insert_many(all_products)
        print(f"✓ {len(all_products)} products created")
    else:
        print(f"✓ Products already exist ({existing_products})")

    # Update category counts
    for cat_data in categories_data:
        count = await db.products.count_documents({"category": cat_data["name"]})
        await db.categories.update_one(
            {"slug": cat_data["slug"]},
            {"$set": {"itemCount": count}},
        )

    # --- Default settings ------------------------------------------------
    existing_settings = await db.settings.find_one({})
    if not existing_settings:
        import uuid as _uuid
        from datetime import datetime as _dt
        await db.settings.insert_one({
            "id": str(_uuid.uuid4()),
            "websiteName": "AgroSmart",
            "favicon": "",
            "menuItems": [
                {"id": "m1", "name": "Acasă", "nameRu": "Главная", "url": "/", "type": "link"},
                {"id": "m2", "name": "Catalog", "nameRu": "Каталог", "url": "/catalog", "type": "link"},
                {"id": "m3", "name": "Branduri", "nameRu": "Бренды", "url": "/brands", "type": "link"},
                {"id": "m4", "name": "Contact", "nameRu": "Контакты", "url": "/contact", "type": "link"},
            ],
            "categoryMenuItems": [],
            "featuredCategoryId": None,
            "heroBanners": [
                {
                    "title": "Totul pentru agricultura ta",
                    "titleRu": "Всё для вашего сельского хозяйства",
                    "subtitle": "Semințe, îngrășăminte, utilaje",
                    "subtitleRu": "Семена, удобрения, техника",
                    "description": "Livrare rapidă în toată Moldova.",
                    "descriptionRu": "Быстрая доставка по всей Молдове.",
                    "buttonText": "Cumpără acum",
                    "buttonTextRu": "Купить",
                    "buttonLink": "/catalog",
                    "image": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600",
                    "badge": "OFERTĂ",
                    "badgeRu": "АКЦИЯ",
                    "order": 0,
                }
            ],
            "albums": [],
            "faqs": [
                {
                    "question": "Livrați în toată Moldova?",
                    "questionRu": "Доставляете по всей Молдове?",
                    "answer": "Da, livrăm în toate localitățile. Livrarea durează 1-3 zile.",
                    "answerRu": "Да, доставляем по всей стране. Доставка 1-3 дня.",
                }
            ],
            "contactInfo": {
                "phone": "+373 22 123 456",
                "email": "contact@agrosmart.md",
                "address": "Str. Agriculturii 15, Chișinău",
                "hours": "Luni-Vineri: 08:00-18:00",
                "facebook": "https://facebook.com/agrosmart",
                "instagram": "https://instagram.com/agrosmart",
                "tiktok": "",
            },
            "bestSellersTabs": [],
            "freshFindsTabs": [],
            "updatedAt": datetime.utcnow(),
        })
        print("✓ Default settings created")

    print("\nDatabase seeded successfully!")
    print(f"\nAdmin credentials:\nEmail: {ADMIN_EMAIL}\nPassword: {ADMIN_PASSWORD}")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
