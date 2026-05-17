import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, User, ShoppingCart, Phone } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";

export default function BottomMobileBar({
  onMenuClick,
}) {
  const location = useLocation();
  const { language } = useLanguage();

  const cartContext = useCart();

  const cartItems =
    cartContext.cartItems ||
    cartContext.cart ||
    cartContext.items ||
    [];

  const cartCount =
    typeof cartContext.cartCount === "number"
      ? cartContext.cartCount
      : cartItems.reduce((total, item) => {
          return total + Number(item.quantity || 1);
        }, 0);

  const labels = {
    ro: {
      menu: "Meniu",
      account: "Contul meu",
      cart: "Coșul meu",
      contact: "Contact",
    },
    ru: {
      menu: "Меню",
      account: "Кабинет",
      cart: "Корзина",
      contact: "Контакты",
    },
    en: {
      menu: "Menu",
      account: "Account",
      cart: "My cart",
      contact: "Contact",
    },
  };

  const tr = labels[language] || labels.ro;

  const openMobileMenu = () => {
    if (typeof onMenuClick === "function") {
      onMenuClick();
      return;
    }

    window.dispatchEvent(new CustomEvent("open-mobile-menu"));
  };

  const items = [
    {
      type: "button",
      label: tr.menu,
      icon: Menu,
      onClick: openMobileMenu,
    },
    {
      type: "link",
      to: language === "ru" ? "/ru/contul-meu" : "/contul-meu",
      label: tr.account,
      icon: User,
    },
    {
      type: "link",
      to: language === "ru" ? "/ru/cart" : "/cart",
      label: tr.cart,
      icon: ShoppingCart,
      count: cartCount,
    },
    {
      type: "link",
      to: language === "ru" ? "/ru/contact" : "/contact",
      label: tr.contact,
      icon: Phone,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-zinc-200 bg-white md:hidden">
      <div className="grid h-[58px] grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          const cleanPath = location.pathname.replace(/^\/ru/, "") || "/";
          const cleanTo = item.to?.replace(/^\/ru/, "") || item.to;
          const isActive = item.to && cleanPath === cleanTo;

          const content = (
            <>
              <div className="relative flex h-6 items-center justify-center">
                <Icon
                  size={22}
                  strokeWidth={2.25}
                  className={isActive ? "text-[#a7cf26]" : "text-zinc-800"}
                />

                {typeof item.count === "number" && item.count > 0 && (
                  <span className="absolute -right-2.5 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#a7cf26] px-[4px] text-[10px] font-black leading-none text-white">
                    {item.count > 99 ? "99+" : item.count}
                  </span>
                )}
              </div>

              <span
                className={`mt-[3px] text-[11px] font-semibold leading-none ${
                  isActive ? "text-[#a7cf26]" : "text-zinc-800"
                }`}
              >
                {item.label}
              </span>
            </>
          );

          if (item.type === "button") {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="flex h-full flex-col items-center justify-center pt-[2px]"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.to}
              className="flex h-full flex-col items-center justify-center pt-[2px]"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}