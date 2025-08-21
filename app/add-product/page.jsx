"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE, PATHS } from "../../lib/api";

const sampleCategories = {
  Ηλεκτρονικά: ["Ακουστικά", "Ηχεία", "Αξεσουάρ"],
  Ρούχα: ["Ανδρικά", "Γυναικεία", "Παιδικά"],
  Υγεία: ["Συνταγές", "Συμπληρώματα"],
};

export default function AddProductPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [imageFiles, setImageFiles] = useState([]); // multiple files
  const [imagePreviews, setImagePreviews] = useState([]); // multiple previews
  const [errors, setErrors] = useState({});
  // refs for enter-to-next behavior
  const fileInputRef = useRef(null);
  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const descriptionRef = useRef(null);
  const categoryRef = useRef(null);
  const subcategoryRef = useRef(null);
  const [serverCategories, setServerCategories] = useState([]);
  const [serverSubcategories, setServerSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");

  function capitalizeDisplay(s) {
    if (typeof s !== "string" || s.length === 0) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  useEffect(() => {
    if (!imageFiles.length) {
      setImagePreviews([]);
      return;
    }
    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [imageFiles]);

  useEffect(() => {
    // reset subcategory when category changes
    setSubcategory("");
  }, [category]);

  useEffect(() => {
    // fetch categories and subcategories from backend
    async function loadEnums() {
      try {
        const [catsRes, subsRes] = await Promise.all([
          fetch(`${API_BASE}${PATHS.CATEGORIES}`),
          fetch(`${API_BASE}${PATHS.SUBCATEGORIES}`),
        ]);

        if (!catsRes.ok || !subsRes.ok) throw new Error("Failed to load enums");

        const cats = await catsRes.json();
        const subs = await subsRes.json();
        setServerCategories(cats);
        setServerSubcategories(subs);
      } catch (err) {
        // fallback to sampleCategories keys if backend unreachable
        setServerCategories(Object.keys(sampleCategories));
        setServerSubcategories([]);
        console.warn("Could not fetch categories/subcategories:", err);
      }
    }

    loadEnums();
  }, []);

  function validate() {
    const e = {};
    if (!name.trim()) e.name = "Απαιτείται όνομα";
    const p = parseFloat(price);
    if (!price || Number.isNaN(p) || p <= 0) e.price = "Εισάγετε έγκυρη τιμή";
    if (!category) e.category = "Επιλέξτε κατηγορία";
    if (!subcategory) e.subcategory = "Επιλέξτε υποκατηγορία";
    if (!description || !description.trim())
      e.description = "Απαιτείται περιγραφή";
    if (!imageFiles.length) e.image = "Πρέπει να επιλέξετε τουλάχιστον μία εικόνα";
    return e;
  }

  function validateField(field) {
    // validate a single field and update errors state (clearing old error for that field)
    const e = {};
    if (field === "name" && !name.trim()) e.name = "Απαιτείται όνομα";
    if (field === "price") {
      const p = parseFloat(price);
      if (!price || Number.isNaN(p) || p <= 0) e.price = "Εισάγετε έγκυρη τιμή";
    }
    if (field === "category" && !category) e.category = "Επιλέξτε κατηγορία";
    if (field === "subcategory" && !subcategory)
      e.subcategory = "Επιλέξτε υποκατηγορία";
    if (field === "description" && (!description || !description.trim()))
      e.description = "Απαιτείται περιγραφή";
    if (field === "image" && !imageFiles.length) e.image = "Πρέπει να επιλέξετε τουλάχιστον μία εικόνα";

    setErrors((prev) => {
      const next = { ...prev };
      // clear this field's previous errors
      if (field === "name") delete next.name;
      if (field === "price") delete next.price;
      if (field === "category") delete next.category;
      if (field === "subcategory") delete next.subcategory;
      if (field === "description") delete next.description;
      if (field === "image") delete next.image;
      // apply new error if present
      Object.assign(next, e);
      return next;
    });

    return Object.keys(e).length === 0;
  }
  function handleImageChange(e) {
    const files = Array.from(e.target.files || []);
    // Append new files to existing ones, avoiding duplicates by name and size
    setImageFiles((prev) => {
      const existing = prev.map(f => f.name + f.size);
      const newFiles = files.filter(f => !existing.includes(f.name + f.size));
      return [...prev, ...newFiles];
    });
    // Reset input value so the same file can be selected again if needed
    if (e.target) e.target.value = null;
  }

  function focusNext(current) {
    if (current === "name") return priceRef.current?.focus();
    if (current === "price") return descriptionRef.current?.focus();
    if (current === "description") return categoryRef.current?.focus();
    if (current === "category") return subcategoryRef.current?.focus();
    if (current === "subcategory") return null;
    if (current === "image") return null;
  }

  function handleEnterKey(e, field) {
    if (e.key !== "Enter") return;
    // allow Shift+Enter in textarea
    if (field === "description" && e.shiftKey) return;
    e.preventDefault();
    const ok = validateField(field);
    if (!ok) return;
    // if last field (image) submit
    if (field === "subcategory") {
      // submit the form from the last visible field
      if (e.target.form?.requestSubmit) {
        e.target.form.requestSubmit();
      } else {
        const submitEvent = new Event("submit", {
          bubbles: true,
          cancelable: true,
        });
        e.target.form?.dispatchEvent(submitEvent);
      }
      return;
    }

    focusNext(field);
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    // send JSON to backend admin create endpoint
    async function submit() {
      setLoading(true);
      try {
        const payload = {
          name,
          price: parseFloat(price),
          description: description || null,
          category: category || null,
          sub_category: subcategory || null,
        };

        // Prepare FormData for backend
        const formData = new FormData();
        formData.append("payload", JSON.stringify(payload));
        imageFiles.forEach((file) => {
          formData.append("images", file); // backend should accept images as a list
        });


  // ...existing code...

        const res = await fetch(`${API_BASE}${PATHS.ADMIN_PRODUCTS}`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (res.status === 200 || res.status === 201) {
          const data = await res.json();
          // show success modal instead of redirecting
          setModalType("success");
          setModalTitle("Επιτυχία");
          setModalMessage("Το προϊόν δημιουργήθηκε με επιτυχία.");
          setModalOpen(true);
          // reset form
          setName("");
          setPrice("");
          setDescription("");
          setCategory("");
          setSubcategory("");
          setImageFiles([]);
          setImagePreviews([]);
        } else if (res.status === 401) {
          setModalType("error");
          setModalTitle("Μη εξουσιοδοτημένο");
          setModalMessage("Παρακαλώ συνδεθείτε ως διαχειριστής.");
          setModalOpen(true);
        } else {
          const err = await res.text();
          // ...existing code...
          setModalType("error");
          setModalTitle("Σφάλμα εξυπηρετητή");
          setModalMessage(`Server error: ${res.status}`);
          setModalOpen(true);
        }
      } catch (err) {
  // ...existing code...
        setModalType("error");
        setModalTitle("Σφάλμα δικτύου");
        setModalMessage(
          "Το αίτημα απέτυχε. Δείτε την κονσόλα για λεπτομέρειες."
        );
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    }

    submit();
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex items-start justify-center flex-1 p-6 overflow-auto md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-[var(--silver-light)]">
                Προσθήκη Νέου Προϊόντος
              </h1>
              <p className="text-[var(--foreground-muted)] mt-1">
                Συμπληρώστε τα πεδία παρακάτω για να προσθέσετε ένα προϊόν.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="glass p-6 sm:p-8 md:p-12 rounded-3xl border border-[var(--border)] shadow-2xl"
            >
              {/* Image placeholder - multiple images, preview, remove */}
              <div className="flex flex-col items-center mb-6">
                <label className="w-full max-w-3xl cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    onKeyDown={(e) => handleEnterKey(e, "image")}
                    className="hidden"
                  />

                  <div className="w-full rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--background-secondary)] p-6 flex items-center justify-center flex-wrap gap-4">
                    {imagePreviews.length ? (
                      imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={src}
                            alt={`preview-${idx}`}
                            className="max-w-[180px] max-h-[180px] object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageFiles((files) => files.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-1 right-1 bg-[var(--error)] text-white rounded-full p-1 text-xs opacity-80 group-hover:opacity-100"
                            title="Αφαίρεση"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-[var(--foreground-muted)] text-center">
                        <p className="mb-1 text-lg font-medium">
                          Κάντε κλικ για να προσθέσετε εικόνες
                        </p>
                        <p className="text-sm">
                          Υποστηρίζονται εικόνες (jpg, png, ...), μπορείτε να επιλέξετε πολλές
                        </p>
                      </div>
                    )}
                  </div>
                </label>

                {errors.image && (
                  <p className="text-sm text-[var(--error)] mt-2">
                    {errors.image}
                  </p>
                )}

                {imagePreviews.length > 0 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setImageFiles([]);
                        setImagePreviews([]);
                      }}
                      className="px-3 py-1 text-sm rounded-md border border-[var(--border)] bg-[rgba(255,255,255,0.02)] text-[var(--foreground)] hover:bg-[var(--background-tertiary)]"
                    >
                      Αφαίρεση Όλων
                    </button>
                  </div>
                )}
              </div>

              <><div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                      Όνομα
                    </label>
                    <input
                      value={name}
                      ref={nameRef}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => handleEnterKey(e, "name")}
                      className={`w-full px-5 py-3 rounded-xl bg-[var(--background-secondary)] border ${errors.name
                          ? "border-[var(--error)]"
                          : "border-[var(--border)]"} text-[var(--foreground)] focus:outline-none`}
                      placeholder="π.χ. Σκουλαρίκι από ατσάλι" />
                    {errors.name && (
                      <p className="text-sm text-[var(--error)] mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                      Τιμή (€)
                    </label>
                    <input
                      value={price}
                      ref={priceRef}
                      onChange={(e) => setPrice(e.target.value)}
                      onKeyDown={(e) => handleEnterKey(e, "price")}
                      className={`w-full px-5 py-3 rounded-xl bg-[var(--background-secondary)] border ${errors.price
                          ? "border-[var(--error)]"
                          : "border-[var(--border)]"} text-[var(--foreground)] focus:outline-none`}
                      placeholder="π.χ. 49.99"
                      inputMode="decimal" />
                    {errors.price && (
                      <p className="text-sm text-[var(--error)] mt-1">
                        {errors.price}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                      Περιγραφή
                    </label>
                    <textarea
                      value={description}
                      ref={descriptionRef}
                      onChange={(e) => setDescription(e.target.value)}
                      onKeyDown={(e) => handleEnterKey(e, "description")}
                      rows={4}
                      className="w-full px-5 py-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none"
                      placeholder="Μια σύντομη περιγραφή του προϊόντος" />
                    {errors.description && (
                      <p className="text-sm text-[var(--error)] mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                      Κατηγορία
                    </label>
                    <select
                      value={category}
                      ref={categoryRef}
                      onChange={(e) => setCategory(e.target.value)}
                      onKeyDown={(e) => handleEnterKey(e, "category")}
                      className={`w-full px-4 py-3 sm:py-3 rounded-lg bg-[var(--background-secondary)] border ${errors.category
                          ? "border-[var(--error)]"
                          : "border-[var(--border)]"} text-[var(--foreground)] focus:outline-none`}
                    >
                      <option value="">-- Επιλέξτε --</option>
                      {(serverCategories.length
                        ? serverCategories
                        : Object.keys(sampleCategories)
                      ).map((cat) => (
                        <option key={cat} value={cat}>
                          {capitalizeDisplay(cat)}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-sm text-[var(--error)] mt-1">
                        {errors.category}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                      Υποκατηγορία
                    </label>
                    <select
                      value={subcategory}
                      ref={subcategoryRef}
                      onChange={(e) => setSubcategory(e.target.value)}
                      onKeyDown={(e) => handleEnterKey(e, "subcategory")}
                      className="w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none"
                    >
                      <option value="">-- Επιλέξτε --</option>
                      {(serverSubcategories.length
                        ? serverSubcategories
                        : category && sampleCategories[category]
                          ? sampleCategories[category]
                          : []
                      ).map((sub) => (
                        <option key={sub} value={sub}>
                          {capitalizeDisplay(sub)}
                        </option>
                      ))}
                    </select>
                    {errors.subcategory && (
                      <p className="text-sm text-[var(--error)] mt-1">
                        {errors.subcategory}
                      </p>
                    )}
                  </div>
                </div><div className="flex flex-col items-center gap-3 mt-6 sm:flex-row">
                    <Link
                      href="/dashboard"
                      className="w-full sm:w-auto text-center px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] bg-[rgba(255,255,255,0.02)]"
                    >
                      Ακύρωση
                    </Link>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto text-center px-6 py-3 bg-[var(--accent)] text-[var(--silver-light)] rounded-lg font-medium shadow disabled:opacity-60"
                    >
                      {loading ? "Αποθήκευση..." : "Αποθήκευση Προϊόντος"}
                    </button>
                  </div></>
            </form>

            {/* Back to dashboard button below the container */}
            <div className="flex justify-center mt-6">
              <Link
                href="/dashboard"
                aria-label="Back to dashboard"
                className="inline-flex items-center gap-3 px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] bg-[rgba(255,255,255,0.02)] hover:bg-[var(--background-tertiary)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L7.414 9H16a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Πίσω στον πίνακα διαχείρισης</span>
              </Link>
            </div>

            {/* Modal */}
            {modalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 backdrop-blur-sm bg-black/30"
                  onClick={() => setModalOpen(false)}
                />
                <div className="relative bg-[var(--background-secondary)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-lg mx-4">
                  <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">
                    {modalTitle}
                  </h3>
                  <p className="text-sm text-[var(--foreground-muted)] mb-4">
                    {modalMessage}
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--silver-light)]"
                    >
                      Κλείσιμο
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
