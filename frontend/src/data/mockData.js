// Mock data for AgroSmart eCommerce

export const categories = [
  { id: 1, name: "Women's Clothing", icon: "👗", itemCount: 120, slug: "womens-clothing" },
  { id: 2, name: "Men's Clothing", icon: "👔", itemCount: 232, slug: "mens-clothing" },
  { id: 3, name: "Kids & Baby Clothing", icon: "👶", itemCount: 534, slug: "kids-clothing" },
  { id: 4, name: "Lingerie & Sleepwear", icon: "🛏️", itemCount: 654, slug: "lingerie" },
  { id: 5, name: "Accessories", icon: "👜", itemCount: 232, slug: "accessories" },
  { id: 6, name: "Jewelry & Watches", icon: "⌚", itemCount: 392, slug: "jewelry" }
];

export const products = [
  {
    id: 1,
    name: "Nebulizer Ultracare",
    price: 28.56,
    originalPrice: 29.56,
    discount: 10,
    rating: 4.5,
    reviews: 118,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
    category: "Women's Clothing",
    storeName: "Fashion Hub",
    badge: "SALES",
    colors: ["#9b59b6", "#3498db", "#e74c3c", "#f1c40f"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    sold: 4,
    available: 200,
    inStock: true
  },
  {
    id: 2,
    name: "Radiance Renewal Serum",
    price: 27.46,
    originalPrice: 29.99,
    discount: 15,
    rating: 4.7,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400",
    category: "Women's Clothing",
    storeName: "Fashion Pro",
    badge: "15% OFF",
    colors: ["#9b59b6", "#3498db", "#e74c3c", "#f1c40f"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    sold: 25,
    available: 180,
    inStock: true
  },
  {
    id: 3,
    name: "Bali Underware Bra",
    price: 27.46,
    originalPrice: 29.99,
    discount: 10,
    rating: 4.6,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
    category: "Lingerie & Sleepwear",
    storeName: "Comfort Wear",
    badge: "15% OFF",
    colors: ["#9b59b6", "#3498db", "#e74c3c", "#f1c40f"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    sold: 15,
    available: 150,
    inStock: true
  },
  {
    id: 4,
    name: "Casual Winter Coat",
    price: 45.99,
    originalPrice: 59.99,
    discount: 23,
    rating: 4.8,
    reviews: 245,
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400",
    category: "Men's Clothing",
    storeName: "Urban Style",
    badge: "SALES",
    colors: ["#2c3e50", "#34495e", "#7f8c8d"],
    sizes: ["M", "L", "XL", "XXL"],
    sold: 42,
    available: 98,
    inStock: true
  },
  {
    id: 5,
    name: "Summer Dress Collection",
    price: 32.99,
    originalPrice: 45.99,
    discount: 28,
    rating: 4.9,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400",
    category: "Women's Clothing",
    storeName: "Trendy Fashion",
    badge: "15% OFF",
    colors: ["#e74c3c", "#3498db", "#2ecc71", "#f39c12"],
    sizes: ["XS", "S", "M", "L", "XL"],
    sold: 67,
    available: 133,
    inStock: true
  },
  {
    id: 6,
    name: "Kids Comfort Wear",
    price: 19.99,
    originalPrice: 29.99,
    discount: 33,
    rating: 4.7,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400",
    category: "Kids & Baby Clothing",
    storeName: "Little Stars",
    badge: "SALES",
    colors: ["#e74c3c", "#3498db", "#f1c40f"],
    sizes: ["2Y", "3Y", "4Y", "5Y", "6Y"],
    sold: 34,
    available: 166,
    inStock: true
  },
  {
    id: 7,
    name: "Elegant Watch",
    price: 89.99,
    originalPrice: 129.99,
    discount: 31,
    rating: 4.8,
    reviews: 423,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400",
    category: "Jewelry & Watches",
    storeName: "Time Piece",
    badge: "15% OFF",
    colors: ["#2c3e50", "#c0392b", "#f39c12"],
    sizes: ["One Size"],
    sold: 89,
    available: 111,
    inStock: true
  },
  {
    id: 8,
    name: "Leather Handbag",
    price: 56.99,
    originalPrice: 79.99,
    discount: 29,
    rating: 4.6,
    reviews: 267,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
    category: "Accessories",
    storeName: "Bag Collection",
    badge: "SALES",
    colors: ["#2c3e50", "#8e44ad", "#c0392b"],
    sizes: ["One Size"],
    sold: 56,
    available: 94,
    inStock: true
  }
];

// Generate more products by duplicating with variations
for (let i = 9; i <= 50; i++) {
  const baseProduct = products[i % products.length];
  products.push({
    ...baseProduct,
    id: i,
    name: `${baseProduct.name} ${i}`,
    price: (Math.random() * 50 + 20).toFixed(2),
    originalPrice: (Math.random() * 80 + 40).toFixed(2)
  });
}

export const sliderData = [
  {
    id: 1,
    badge: "Get up to 30% of on your first $150 purchase",
    title: "Discover the Season's Newest Styles",
    description: "Explore a fresh collection of trends, colors, and silhouettes curated to elevate your everyday look.",
    image: "https://www.ro.weber/files/ro/styles/1920x1080/public/pictures/2025-09/banner%20weberfloor%20fast%201920x1080.jpg.webp?itok=l-4LiKiu",
    bgColor: "#F7DC6F",
    buttonText: "Shop Now"
  },
  {
    id: 2,
    badge: "Get up to 30% of on your first $150 purchase",
    title: "Stay Warm for Less",
    description: "Grab exclusive deals on sweaters, hoodies, coats, and cold-weather must-haves before the season ends.",
    image: "https://panourisandwich.md/wp-content/uploads/2022/04/banner-oficiu-modular-ro.jpg",
    bgColor: "#F7DC6F",
    buttonText: "Shop Now"
  },
  {
    id: 3,
    badge: "Get up to 30% of on your first $150 purchase",
    title: "Fashion for the Modern Elite",
    description: "Experience luxury craftsmanship, timeless silhouettes, and high-quality fabrics made for a refined wardrobe.",
    image: "https://macrinashop.ro/wp-content/uploads/2021/08/macrina-materiale-de-constructii-adeplast-banner-1.jpg",
    bgColor: "#F7DC6F"
  },
  {
    id: 4,
    badge: "Get up to 30% of on your first $150 purchase",
    title: "Wrap Yourself in Winter Elegance",
    description: "Handcrafted designs & premium fabrics for a timeless look.",
    image: "https://panourisandwich.md/wp-content/uploads/2022/12/banner-1920x650-site-ro-100000-lei.jpg",
    bgColor: "#F7DC6F"
  },
  {
    id: 5,
    image: "https://img.freepik.com/premium-psd/youtube-video-thumbnail-web-banner-template-business-video-youtube-marketing-graphic-channel_797457-127.jpg?semt=ais_hybrid&w=740&q=80",
  }
];

export const brands = [
  { id: 1, name: "Cowshed", logo: "https://via.placeholder.com/120x60?text=Cowshed" },
  { id: 2, name: "Ninoa", logo: "https://via.placeholder.com/120x60?text=Ninoa" },
  { id: 3, name: "Claudia", logo: "https://via.placeholder.com/120x60?text=Claudia" },
  { id: 4, name: "Minut", logo: "https://via.placeholder.com/120x60?text=Minut" },
  { id: 5, name: "Orchard", logo: "https://via.placeholder.com/120x60?text=Orchard" }
];
