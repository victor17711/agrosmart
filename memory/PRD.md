# AgroSmart (Domix Clone) — PRD

## Original Problem Statement
"Vreau sa faci o clona totală la acest proiect, sa fie si frontend si backend, dar sa modifici baza de date, sa faci totul pe curat, si sa numești gen agrosmart_database — https://github.com/victor17711/domix.git"

## User Choices (2026-02)
- DB name: `agrosmart_database` with admin + demo categories/products
- Admin creds: `admin@agrosmart.md` / `admin123`
- Telegram notifier: kept but disabled (no token)
- Rebranding: visible text DOMIX → AgroSmart
- Scope: Home, My Account, Cart, Checkout, Category, Product, full Admin panel. `Servicii` page not needed (kept in code but unlinked).

## Architecture
- Backend: FastAPI + Motor (async MongoDB) — `/app/backend/server.py` (~2200 lines)
- Auth: JWT via `/app/backend/auth_utils.py` + `dependencies.py`
- Models: `/app/backend/models.py` (User, Product, Category, Brand, Cart, Wishlist, Order, Review, Page, Settings, ContactRequest, NewsletterSubscription, InstallmentRequest, Gift, GiftCondition, GiftLead)
- Seed: `/app/backend/seed_db.py` — AgroSmart agri categories/products
- Telegram: `/app/backend/telegram_notifier.py` (no-op without token)
- Frontend: React 19 + craco + Tailwind + shadcn/ui + Swiper + lucide-react
- Routes: Home, Catalog, Brands, Brand, Category, Product, Cart, Checkout, MyAccount, FAQ, Contact, Search, About, DynamicPage, OrderSuccess, 404, Admin(login/dashboard/products/categories/brands/users/orders/requests/settings/content/pages/gifts/gift-conditions)
- i18n: RO + RU via `/app/frontend/src/i18n/translations.js`

## Implemented (2026-02)
- Full clone of Domix repo into /app (backend + frontend)
- DB renamed to `agrosmart_database`, fresh seed with admin + 6 agri categories + 4 brands + 12 agri products + default site settings
- Text rebrand DOMIX → AgroSmart (Navbar, Footer, AdminLayout, AdminLogin, defaults, API root message, contact email)
- Logos replaced with "AgroSmart" wordmark
- Backend deps installed: bcrypt, passlib, python-jose, openpyxl, httpx, python-multipart, email-validator
- Frontend deps added: swiper, react-icons, @radix-ui/react-toast
- Admin creds persisted in `/app/memory/test_credentials.md`

## Backlog / Next Items (P1)
- End-to-end test pass with testing agent
- Optional: replace DOMIX logo.png asset with AgroSmart logo image
- Optional: Enable Telegram order notifications (add TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID to backend/.env)
- Optional: Remove /servicii route from App.js if confirmed
