from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    firstName: str
    lastName: str
    role: Optional[str] = "user"  # user, manager, or admin

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    firstName: str
    lastName: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postalCode: Optional[str] = None
    role: str = "user"  # user, manager, or admin
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    firstName: str
    lastName: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postalCode: Optional[str] = None
    role: str

# Brand Models
class BrandCreate(BaseModel):
    name: str
    logo: Optional[str] = ""
    description: Optional[str] = ""

class Brand(BrandCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=datetime.utcnow)

# Product Models
class ProductSpecification(BaseModel):
    title: str
    titleRu: Optional[str] = ""  # Russian translation
    value: str
    valueRu: Optional[str] = ""  # Russian translation

class ProductCreate(BaseModel):
    name: str
    nameRu: Optional[str] = ""  # Russian translation
    slug: Optional[str] = ""  # URL-friendly name (auto-generated if empty)
    description: Optional[str] = ""
    descriptionRu: Optional[str] = ""  # Russian translation
    price: float
    originalPrice: Optional[float] = None
    discount: Optional[int] = 0
    category: Optional[str] = ""  # Primary category (backward compatibility)
    categories: Optional[List[str]] = []  # Multiple categories support
    categoryId: Optional[str] = None  # Support both category and categoryId
    brandId: Optional[str] = None
    storeName: Optional[str] = ""
    storeNameRu: Optional[str] = ""  # Russian translation
    image: Optional[str] = ""  # Primary image (optional for backward compatibility)
    images: Optional[List[str]] = []  # Up to 5 images
    colors: Optional[List[str]] = []
    sizes: Optional[List[str]] = []
    specifications: Optional[List[ProductSpecification]] = []
    rating: Optional[float] = 0.0
    reviews: Optional[int] = 0
    sold: Optional[int] = 0
    available: Optional[int] = 100
    stock: Optional[int] = 100  # Support both available and stock
    inStock: Optional[bool] = True
    isActive: Optional[bool] = True  # Support isActive field from Excel
    sku: Optional[str] = ""  # Support SKU field from Excel
    badge: Optional[str] = ""
    badgeRu: Optional[str] = ""  # Russian translation for badge

class Product(ProductCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# Category Models
class CategoryCreate(BaseModel):
    name: str
    nameRu: Optional[str] = ""  # Russian translation
    slug: str
    icon: Optional[str] = ""
    image: Optional[str] = ""
    parentId: Optional[str] = None
    itemCount: Optional[int] = 0

class Category(CategoryCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=datetime.utcnow)

# Cart Models
class CartItem(BaseModel):
    productId: str
    quantity: int
    selectedSize: Optional[str] = None
    selectedColor: Optional[str] = None
    price: float

class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    items: List[CartItem] = []
    total: float = 0.0
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class AddToCartRequest(BaseModel):
    productId: str
    quantity: int = 1
    selectedSize: Optional[str] = None
    selectedColor: Optional[str] = None

# Wishlist Models
class Wishlist(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    products: List[str] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)

# Review Models
class ReviewCreate(BaseModel):
    productId: str
    userName: str
    userEmail: str
    rating: int  # 1-5
    comment: str

class Review(ReviewCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Order Models
class OrderItem(BaseModel):
    productId: str
    name: str
    price: float
    quantity: int
    image: str
    selectedSize: Optional[str] = ""
    selectedColor: Optional[str] = ""

class ShippingAddress(BaseModel):
    fullName: str
    phone: str
    email: str
    address: str
    city: str
    postalCode: Optional[str] = ""
    notes: Optional[str] = ""

class OrderCreate(BaseModel):
    userId: str
    customerEmail: str
    customerName: str
    customerPhone: str
    items: List[OrderItem]
    shippingAddress: ShippingAddress
    totalAmount: float
    status: str = "pending"
    paymentMethod: str = "cash_on_delivery"

class Order(OrderCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# Admin Dashboard Models
class DashboardStats(BaseModel):
    totalUsers: int
    totalProducts: int
    totalOrders: int
    totalRevenue: float
    pendingOrders: int
    lowStockProducts: int

# Menu Item Models
class MenuItem(BaseModel):
    id: str
    name: str
    nameRu: Optional[str] = ""  # Russian translation
    url: str
    type: str  # 'link', 'category', 'page'
    icon: Optional[str] = None
    categoryId: Optional[str] = None
    pageId: Optional[str] = None
    hasChildren: Optional[bool] = None
    children: Optional[List['MenuItem']] = None
    parentId: Optional[str] = None

# Settings Models
class HeroBanner(BaseModel):
    title: Optional[str] = ""
    titleRu: Optional[str] = ""  # Russian translation
    subtitle: Optional[str] = ""
    subtitleRu: Optional[str] = ""  # Russian translation
    description: Optional[str] = ""
    descriptionRu: Optional[str] = ""  # Russian translation
    buttonText: Optional[str] = ""
    buttonTextRu: Optional[str] = ""  # Russian translation
    buttonLink: Optional[str] = ""
    image: Optional[str] = ""
    badge: Optional[str] = ""
    badgeRu: Optional[str] = ""  # Russian translation
    order: Optional[int] = 0

class ServiceAlbum(BaseModel):
    title: str
    coverImage: str
    galleryImages: List[str] = []

# Home section tab configuration (BestSellers / FreshFinds)
class HomeSectionTab(BaseModel):
    categoryId: str  # Reference to Category.id
    label: Optional[str] = ""  # Optional custom label; falls back to category name
    labelRu: Optional[str] = ""  # Optional custom Russian label
    order: Optional[int] = 0

# FAQ Models
class FAQ(BaseModel):
    question: str
    questionRu: Optional[str] = ""  # Russian translation
    answer: str
    answerRu: Optional[str] = ""  # Russian translation

# Contact Info Models
class ContactInfo(BaseModel):
    phone: Optional[str] = ""
    email: Optional[str] = ""
    address: Optional[str] = ""
    hours: Optional[str] = ""
    facebook: Optional[str] = ""
    instagram: Optional[str] = ""
    tiktok: Optional[str] = ""

class SettingsCreate(BaseModel):
    menuItems: List[MenuItem] = []
    categoryMenuItems: List[MenuItem] = []
    featuredCategoryId: Optional[str] = None
    heroBanners: Optional[List[HeroBanner]] = []
    albums: Optional[List[ServiceAlbum]] = []
    faqs: Optional[List[FAQ]] = []
    contactInfo: Optional[ContactInfo] = ContactInfo()
    websiteName: Optional[str] = "AgroSmart"
    favicon: Optional[str] = ""
    bestSellersTabs: Optional[List[HomeSectionTab]] = []
    freshFindsTabs: Optional[List[HomeSectionTab]] = []

class Settings(SettingsCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# Page Models
class PageCreate(BaseModel):
    title: str
    titleRu: Optional[str] = ""
    slug: str
    content: str
    contentRu: Optional[str] = ""
    isPublished: Optional[bool] = True

class Page(PageCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# Contact Request Models
class ContactRequestCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    subject: str
    message: str

class ContactRequest(ContactRequestCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "new"  # new, read, replied

# Newsletter Subscription Models
class NewsletterSubscriptionCreate(BaseModel):
    email: str

class NewsletterSubscription(NewsletterSubscriptionCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "active"  # active, unsubscribed

# Installment Request Models
class InstallmentRequestCreate(BaseModel):
    productId: str
    productName: str
    productPrice: float
    name: str
    phone: str

class InstallmentRequest(InstallmentRequestCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "new"  # new, contacted, approved, rejected

# Gift System Models
class GiftCreate(BaseModel):
    name: str
    nameRu: Optional[str] = ""
    description: Optional[str] = ""
    descriptionRu: Optional[str] = ""
    image: Optional[str] = ""
    isActive: Optional[bool] = True

class Gift(GiftCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GiftConditionCreate(BaseModel):
    name: str
    categoryId: Optional[str] = ""   # empty = no category filter
    brandId: Optional[str] = ""      # empty = no brand filter
    productIds: Optional[List[str]] = []  # specific products to match (empty = any match via category/brand)
    giftIds: List[str] = []          # which gifts to display
    minTime: Optional[int] = 8       # min seconds before popup shows
    maxTime: Optional[int] = 12      # max seconds before popup shows
    isActive: Optional[bool] = True

class GiftCondition(GiftConditionCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GiftLeadCreate(BaseModel):
    productId: str
    productName: Optional[str] = ""
    giftConditionId: Optional[str] = ""
    giftIds: Optional[List[str]] = []
    customerName: str
    customerPhone: str

class GiftLead(GiftLeadCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "new"  # new, contacted

# Rebuild MenuItem model to resolve forward references for recursive children
MenuItem.model_rebuild()
