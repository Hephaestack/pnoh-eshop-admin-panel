"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { API_BASE, PATHS } from "../../../lib/api";

const Icons = {
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
  Upload: () => (
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
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  ),
  Save: () => (
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
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  ),
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.id;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [currentImages, setCurrentImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const descriptionRef = useRef(null);
  const categoryRef = useRef(null);
  const subcategoryRef = useRef(null);

  const [serverCategories, setServerCategories] = useState([]);
  const [serverSubcategories, setServerSubcategories] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");

  function capitalizeDisplay(s) {
    if (typeof s !== "string" || s.length === 0) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  useEffect(() => {
    setSubcategory("");
  }, [category]);

  useEffect(() => {
    loadInitialData();
  }, [productId, searchParams]); // Added searchParams to dependencies

  async function loadInitialData() {
    setLoading(true);
    try {
      // Add cache-busting timestamp to ensure fresh data
      const cacheBuster = `?_=${Date.now()}`;

      const [productRes, catsRes, subsRes] = await Promise.all([
        fetch(`${API_BASE}${PATHS.PRODUCTS}/${productId}${cacheBuster}`, {
          credentials: "include",
          cache: "no-cache", // Ensure no caching
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }),
        fetch(`${API_BASE}${PATHS.CATEGORIES}${cacheBuster}`, {
          credentials: "include",
          cache: "no-cache",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }),
        fetch(`${API_BASE}${PATHS.SUBCATEGORIES}${cacheBuster}`, {
          credentials: "include",
          cache: "no-cache",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }),
      ]);

      if (!productRes.ok || !catsRes.ok || !subsRes.ok) {
        throw new Error("Failed to load data");
      }

      const [product, cats, subs] = await Promise.all([
        productRes.json(),
        catsRes.json(),
        subsRes.json(),
      ]);

      console.log("Loaded fresh product data:", product); // Debug log

      // Populate form with existing product data
      setName(product.name || "");
      setPrice(product.price?.toString() || "");
      setDescription(product.description || "");
      setCategory(product.category || "");
      setSubcategory(product.sub_category || "");
      setCurrentImages(product.image_url || []);

      setServerCategories(cats);
      setServerSubcategories(subs);
    } catch (err) {
      console.error("Error loading data:", err);
      showModal(
        "Error",
        "Failed to load product data. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    const e = {};
    if (!name.trim()) e.name = "Απαιτείται όνομα";
    const p = parseFloat(price);
    if (!price || Number.isNaN(p) || p <= 0) e.price = "Εισάγετε έγκυρη τιμή";
    if (!category) e.category = "Επιλέξτε κατηγορία";
    if (!subcategory) e.subcategory = "Επιλέξτε υποκατηγορία";
    if (!description || !description.trim())
      e.description = "Απαιτείται περιγραφή";
    return e;
  }

  function validateField(field) {
    const tempErrors = { ...errors };
    delete tempErrors[field];

    if (field === "name" && !name.trim()) {
      tempErrors.name = "Απαιτείται όνομα";
    } else if (field === "price") {
      const p = parseFloat(price);
      if (!price || Number.isNaN(p) || p <= 0) {
        tempErrors.price = "Εισάγετε έγκυρη τιμή";
      }
    } else if (field === "category" && !category) {
      tempErrors.category = "Επιλέξτε κατηγορία";
    } else if (field === "subcategory" && !subcategory) {
      tempErrors.subcategory = "Επιλέξτε υποκατηγορία";
    } else if (
      field === "description" &&
      (!description || !description.trim())
    ) {
      tempErrors.description = "Απαιτείται περιγραφή";
    }

    setErrors(tempErrors);
  }

  function showModal(title, message, type = "info") {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    if (modalType === "success") {
      // Force a refresh by adding a timestamp parameter
      router.push("/view-products?refresh=" + Date.now());
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);

    try {
      const requestBody = {
        name: name.trim(),
        price: parseFloat(price),
        description: description.trim(),
        category: category,
        sub_category: subcategory,
        image_url: currentImages || [], // Include existing images
      };

      console.log(
        "Sending update request to:",
        `${API_BASE}${PATHS.ADMIN_PRODUCTS}${productId}`
      );
      console.log("Request body:", requestBody);

      const response = await fetch(
        `${API_BASE}${PATHS.ADMIN_PRODUCTS}${productId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error response:", errorData);
        throw new Error(
          errorData.detail
            ? Array.isArray(errorData.detail)
              ? errorData.detail.map((e) => e.msg).join(", ")
              : errorData.detail
            : "Failed to update product"
        );
      }

      const responseData = await response.json();
      console.log("Success response:", responseData);

      showModal("Επιτυχία!", "Το προϊόν ενημερώθηκε επιτυχώς!", "success");
      setErrors({});
    } catch (err) {
      console.error("Error updating product:", err);
      showModal(
        "Σφάλμα",
        err.message || "Αποτυχία ενημέρωσης προϊόντος. Δοκιμάστε ξανά.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e, nextRef) {
    if (e.key === "Enter" && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-8 h-8 border-4 border-[var(--silver)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--foreground-muted)]">Loading product...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center mb-8 space-x-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/view-products"
            className="p-2 hover:bg-[var(--background-secondary)] rounded-lg transition-colors text-[var(--foreground-muted)] hover:text-[var(--silver-light)]"
          >
            <Icons.ArrowLeft />
          </Link>
          <h1 className="text-3xl font-bold text-[var(--silver-light)]">
            Edit Product
          </h1>
        </motion.div>

        {/* Form */}
        <motion.div
          className="p-6 glass rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--silver-light)] mb-2">
                Όνομα Προϊόντος *
              </label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => validateField("name")}
                onKeyDown={(e) => handleKeyDown(e, priceRef)}
                className="w-full px-4 py-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--silver)] focus:border-[var(--silver)] text-[var(--foreground)] placeholder-[var(--foreground-muted)]"
                placeholder="Εισάγετε το όνομα του προϊόντος"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-[var(--error)]">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-[var(--silver-light)] mb-2">
                Τιμή (€) *
              </label>
              <input
                ref={priceRef}
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onBlur={() => validateField("price")}
                onKeyDown={(e) => handleKeyDown(e, descriptionRef)}
                className="w-full px-4 py-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--silver)] focus:border-[var(--silver)] text-[var(--foreground)] placeholder-[var(--foreground-muted)]"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-[var(--error)]">
                  {errors.price}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[var(--silver-light)] mb-2">
                Περιγραφή *
              </label>
              <textarea
                ref={descriptionRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => validateField("description")}
                rows={4}
                className="w-full px-4 py-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--silver)] focus:border-[var(--silver)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] resize-none"
                placeholder="Εισάγετε την περιγραφή του προϊόντος"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-[var(--error)]">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-[var(--silver-light)] mb-2">
                Κατηγορία *
              </label>
              <select
                ref={categoryRef}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onBlur={() => validateField("category")}
                className="w-full px-4 py-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--silver)] focus:border-[var(--silver)] text-[var(--foreground)]"
              >
                <option value="">Επιλέξτε κατηγορία</option>
                {serverCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {capitalizeDisplay(cat)}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-[var(--error)]">
                  {errors.category}
                </p>
              )}
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-medium text-[var(--silver-light)] mb-2">
                Υποκατηγορία *
              </label>
              <select
                ref={subcategoryRef}
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                onBlur={() => validateField("subcategory")}
                className="w-full px-4 py-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--silver)] focus:border-[var(--silver)] text-[var(--foreground)]"
              >
                <option value="">Επιλέξτε υποκατηγορία</option>
                {serverSubcategories.map((subcat) => (
                  <option key={subcat} value={subcat}>
                    {capitalizeDisplay(subcat)}
                  </option>
                ))}
              </select>
              {errors.subcategory && (
                <p className="mt-1 text-sm text-[var(--error)]">
                  {errors.subcategory}
                </p>
              )}
            </div>

            {/* Current Images */}
            {currentImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-[var(--silver-light)] mb-2">
                  Τρέχουσες Εικόνες
                </label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {currentImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-[var(--background-secondary)] rounded-lg overflow-hidden"
                    >
                      <img
                        src={imageUrl}
                        alt={`Product image ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.push("/view-products")}
                className="flex-1 px-6 py-3 border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
              >
                Ακύρωση
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-[var(--accent)] text-[var(--silver-light)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[var(--silver-light)] border-t-transparent rounded-full animate-spin"></div>
                    <span>Αποθήκευση...</span>
                  </>
                ) : (
                  <>
                    <Icons.Save />
                    <span>Ενημέρωση Προϊόντος</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Modal */}
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md p-6 glass rounded-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-[var(--silver-light)] mb-4">
                {modalTitle}
              </h3>
              <p className="text-[var(--foreground-muted)] mb-6">
                {modalMessage}
              </p>
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-[var(--accent)] text-[var(--silver-light)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
