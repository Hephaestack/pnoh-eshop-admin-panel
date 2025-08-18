export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const PATHS = {
  CATEGORIES: process.env.NEXT_PUBLIC_CATEGORIES_PATH || "/categories",
  SUBCATEGORIES: process.env.NEXT_PUBLIC_SUBCATEGORIES_PATH || "/subcategories",
  ADMIN_PRODUCTS:
    process.env.NEXT_PUBLIC_ADMIN_PRODUCTS_PATH || "/admin/products/",
  PRODUCTS: process.env.NEXT_PUBLIC_PRODUCTS_PATH || "/products",
};

export const AUTH = {
  COOKIE_NAME: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "token",
};
