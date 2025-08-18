"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE, PATHS } from "../../lib/api";

// Icons
const Icons = {
  Search: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  Filter: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
      />
    </svg>
  ),
  Edit: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  ),
  View: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  Delete: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  Plus: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  ),
  ArrowLeft: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  ),
  X: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  SortUp: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  ),
  SortDown: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  ),
};

export default function ViewProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  function capitalizeDisplay(str) {
    if (typeof str !== "string" || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
  }

  // Fetch data on component mount and when page comes into focus
  useEffect(() => {
    fetchAllData();
  }, []);

  // Refetch data when the page becomes visible (user returns from edit)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAllData();
      }
    };

    const handleFocus = () => {
      fetchAllData();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const fetchAllData = async () => {
    const timestamp = Date.now();
    console.log("Fetching all products data with timestamp:", timestamp);
    setLoading(true);
    try {
      const [productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
        fetch(`${API_BASE}${PATHS.PRODUCTS}/all?limit=1000&t=${timestamp}`, {
          credentials: "include",
          cache: "no-cache",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }),
        fetch(`${API_BASE}${PATHS.CATEGORIES}?t=${timestamp}`, {
          credentials: "include",
          cache: "no-cache",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }),
        fetch(`${API_BASE}${PATHS.SUBCATEGORIES}?t=${timestamp}`, {
          credentials: "include",
          cache: "no-cache",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }),
      ]);

      if (!productsRes.ok || !categoriesRes.ok || !subcategoriesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [productsData, categoriesData, subcategoriesData] =
        await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          subcategoriesRes.json(),
        ]);

      console.log("Fetched products:", productsData);
      setProducts(productsData);
      setCategories(categoriesData);
      setSubcategories(subcategoriesData);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      const matchesSubcategory =
        !selectedSubcategory || product.sub_category === selectedSubcategory;

      return matchesSearch && matchesCategory && matchesSubcategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "price") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(
        `${API_BASE}${PATHS.ADMIN_PRODUCTS}${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter((p) => p.id !== productId));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Αποτυχία διαγραφής προϊόντος. Παρακαλώ δοκιμάστε ξανά.");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSortBy("name");
    setSortOrder("asc");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-8 h-8 border-4 border-[var(--silver)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--foreground-muted)]">Loading products...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div
          className="space-y-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-[var(--error)] text-xl font-semibold">
            {error}
          </div>
          <button
            onClick={fetchAllData}
            className="px-4 py-2 bg-[var(--accent)] text-[var(--silver-light)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-3 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-4 lg:mb-0">
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="p-2 hover:bg-[var(--background-secondary)] rounded-lg transition-colors text-[var(--foreground-muted)] hover:text-[var(--silver-light)]"
                >
                  <Icons.ArrowLeft />
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--silver-light)]">
                  Όλα τα Προϊόντα
                </h1>
              </div>
              <span className="bg-[var(--accent)] text-[var(--silver-light)] text-sm font-medium px-3 py-1 rounded-full self-start sm:self-auto">
                {filteredAndSortedProducts.length} προϊόντα
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/add-product"
                className="inline-flex items-center space-x-2 bg-[var(--accent)] text-[var(--silver-light)] px-3 sm:px-4 py-2 rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm sm:text-base"
              >
                <Icons.Plus />
                <span className="hidden sm:inline">Προσθήκη Προϊόντος</span>
                <span className="sm:hidden">Προσθήκη</span>
              </Link>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="p-3 sm:p-4 glass rounded-xl">
            <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Αναζήτηση προϊόντων..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--silver)] focus:border-[var(--silver)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] text-sm sm:text-base"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground-muted)]">
                  <Icons.Search className="w-4 h-4" />
                </div>
              </div>

              {/* Mobile Filter Controls */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--background-secondary)] transition-colors text-[var(--foreground)] text-sm sm:text-base"
                >
                  <Icons.Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Φίλτρα</span>
                </button>

                {/* Clear Filters */}
                {(searchTerm ||
                  selectedCategory ||
                  selectedSubcategory ||
                  sortBy !== "name" ||
                  sortOrder !== "asc") && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-[var(--error)] border border-[var(--error)] rounded-lg hover:bg-[var(--error)]/10 transition-colors text-sm sm:text-base"
                  >
                    <Icons.X className="w-4 h-4" />
                    <span className="hidden sm:inline">Καθαρισμός</span>
                  </button>
                )}
              </div>
            </div>

            {/* Extended Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 sm:py-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--silver)] focus:border-[var(--silver)] text-[var(--foreground)] text-sm sm:text-base"
                  >
                    <option value="">Όλες οι Κατηγορίες</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {capitalizeDisplay(category)}
                      </option>
                    ))}
                  </select>

                  {/* Subcategory Filter */}
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full px-3 py-2 sm:py-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--silver)] focus:border-[var(--silver)] text-[var(--foreground)] text-sm sm:text-base"
                  >
                    <option value="">Όλες οι Υποκατηγορίες</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {capitalizeDisplay(subcategory)}
                      </option>
                    ))}
                  </select>

                  {/* Sort */}
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split("-");
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="w-full px-3 py-2 sm:py-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--silver)] focus:border-[var(--silver)] text-[var(--foreground)] text-sm sm:text-base sm:col-span-2 lg:col-span-1"
                  >
                    <option value="name-asc">Όνομα (Α-Ω)</option>
                    <option value="name-desc">Όνομα (Ω-Α)</option>
                    <option value="price-asc">Τιμή (Χαμηλή-Υψηλή)</option>
                    <option value="price-desc">Τιμή (Υψηλή-Χαμηλή)</option>
                    <option value="created_at-desc">Νεότερα Πρώτα</option>
                    <option value="created_at-asc">Παλαιότερα Πρώτα</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Products Grid */}
        {filteredAndSortedProducts.length === 0 ? (
          <motion.div
            className="py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-[var(--foreground-muted)] text-6xl mb-4">
              📦
            </div>
            <h3 className="text-xl font-semibold text-[var(--silver-light)] mb-2">
              Δεν βρέθηκαν προϊόντα
            </h3>
            <p className="text-[var(--foreground-muted)] mb-4">
              {products.length === 0
                ? "Δεν έχουν προστεθεί προϊόντα ακόμα."
                : "Δοκιμάστε να τροποποιήσετε την αναζήτηση ή τα φίλτρα σας."}
            </p>
            <Link
              href="/add-product"
              className="inline-flex items-center space-x-2 bg-[var(--accent)] text-[var(--silver-light)] px-4 py-2 rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
            >
              <Icons.Plus />
              <span>Προσθήκη Προϊόντος</span>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredAndSortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="glass rounded-xl overflow-hidden hover:bg-[var(--background-secondary)] transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Product Image */}
                <div className="aspect-square bg-[var(--background-secondary)] overflow-hidden">
                  {product.image_url && product.image_url.length > 0 ? (
                    <img
                      src={product.image_url[0]}
                      alt={product.name}
                      className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--foreground-muted)]">
                      <div className="text-4xl">📷</div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-[var(--silver-light)] mb-2 line-clamp-2 text-sm sm:text-base">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-[var(--foreground-muted)] text-xs sm:text-sm mb-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.category && (
                      <span className="bg-[var(--accent)] text-[var(--silver-light)] text-xs font-medium px-2 py-1 rounded">
                        {capitalizeDisplay(product.category)}
                      </span>
                    )}
                    {product.sub_category && (
                      <span className="bg-[var(--silver-dark)] text-[var(--background)] text-xs font-medium px-2 py-1 rounded">
                        {capitalizeDisplay(product.sub_category)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-bold text-[var(--silver-light)]">
                      €{product.price}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductModal(true);
                        }}
                        className="p-1.5 sm:p-2 text-[var(--silver)] hover:bg-[var(--accent)] rounded-lg transition-colors"
                        title="View Product"
                      >
                        <Icons.View className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          // Add a timestamp to force fresh data loading in edit page
                          const timestamp = Date.now();
                          router.push(
                            `/edit-product/${product.id}?t=${timestamp}`
                          );
                        }}
                        className="p-1.5 sm:p-2 text-[var(--success)] hover:bg-[var(--success)]/10 rounded-lg transition-colors"
                        title="Επεξεργασία Προϊόντος"
                      >
                        <Icons.Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setProductToDelete(product);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 sm:p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors"
                        title="Διαγραφή Προϊόντος"
                      >
                        <Icons.Delete className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && productToDelete && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-md mx-4 p-4 sm:p-6 glass rounded-xl"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <h3 className="text-base sm:text-lg font-semibold text-[var(--silver-light)] mb-4">
                  Διαγραφή Προϊόντος
                </h3>
                <p className="text-[var(--foreground-muted)] mb-4 sm:mb-6 text-sm sm:text-base">
                  Είστε σίγουροι ότι θέλετε να διαγράψετε το "
                  {productToDelete.name}"; Αυτή η ενέργεια δεν μπορεί να
                  αναιρεθεί.
                </p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setProductToDelete(null);
                    }}
                    className="flex-1 px-4 py-2 border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--background-secondary)] transition-colors text-sm sm:text-base"
                  >
                    Ακύρωση
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(productToDelete.id)}
                    className="flex-1 px-4 py-2 bg-[var(--error)] text-white rounded-lg hover:bg-[var(--error)]/80 transition-colors text-sm sm:text-base"
                  >
                    Διαγραφή
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product View Modal */}
        <AnimatePresence>
          {showProductModal && selectedProduct && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="glass rounded-xl p-4 sm:p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-[var(--silver-light)]">
                    Λεπτομέρειες Προϊόντος
                  </h3>
                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      setSelectedProduct(null);
                    }}
                    className="p-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <Icons.X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedProduct.image_url &&
                    selectedProduct.image_url.length > 0 && (
                      <div className="aspect-video bg-[var(--background-secondary)] rounded-lg overflow-hidden">
                        <img
                          src={selectedProduct.image_url[0]}
                          alt={selectedProduct.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}

                  <div>
                    <h4 className="font-semibold text-[var(--silver-light)] text-lg">
                      {selectedProduct.name}
                    </h4>
                    <p className="text-2xl font-bold text-[var(--silver)] mt-1">
                      €{selectedProduct.price}
                    </p>
                  </div>

                  {selectedProduct.description && (
                    <div>
                      <h5 className="font-medium text-[var(--silver-light)] mb-2">
                        Περιγραφή
                      </h5>
                      <p className="text-[var(--foreground-muted)]">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {selectedProduct.category && (
                      <div>
                        <h5 className="font-medium text-[var(--silver-light)] mb-1">
                          Κατηγορία
                        </h5>
                        <span className="bg-[var(--accent)] text-[var(--silver-light)] text-sm font-medium px-3 py-1 rounded">
                          {capitalizeDisplay(selectedProduct.category)}
                        </span>
                      </div>
                    )}
                    {selectedProduct.sub_category && (
                      <div>
                        <h5 className="font-medium text-[var(--silver-light)] mb-1">
                          Υποκατηγορία
                        </h5>
                        <span className="bg-[var(--silver-dark)] text-[var(--background)] text-sm font-medium px-3 py-1 rounded">
                          {capitalizeDisplay(selectedProduct.sub_category)}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedProduct.created_at && (
                    <div>
                      <h5 className="font-medium text-[var(--silver-light)] mb-1">
                        Δημιουργήθηκε
                      </h5>
                      <p className="text-[var(--foreground-muted)] text-sm">
                        {new Date(
                          selectedProduct.created_at
                        ).toLocaleDateString("el-GR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
