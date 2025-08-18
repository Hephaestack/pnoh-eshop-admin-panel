"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Icons - using SVG for consistency
const Icons = {
  Dashboard: () => (
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
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
      />
    </svg>
  ),
  Products: () => (
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
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  Orders: () => (
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
        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  ),
  Menu: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  ),
  Close: () => (
    <svg
      className="w-6 h-6"
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
  Logout: () => (
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
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
  Bell: () => (
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
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  ),
};

const sidebarItems = [
  {
    id: "dashboard",
    label: "Ταμπλό",
    icon: Icons.Dashboard,
    href: "/dashboard",
  },
  {
    id: "products",
    label: "Προϊόντα",
    icon: Icons.Products,
    href: "/view-products",
  },
  {
    id: "orders",
    label: "Παραγγελίες",
    icon: Icons.Orders,
    href: "/dashboard/orders",
  },
];

function Sidebar({ isOpen, onClose, activeItem, setActiveItem }) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed left-0 top-0 h-full w-64 glass z-50 lg:relative lg:z-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
        initial={false}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--silver)] to-[var(--silver-dark)] rounded-lg flex items-center justify-center">
                <span className="text-[var(--background)] font-bold text-sm">
                  P
                </span>
              </div>
              <span className="text-[var(--silver-light)] font-semibold text-lg">
                Pnoh Διαχείριση
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-[var(--accent)] text-[var(--foreground-muted)]"
            >
              <Icons.Close />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeItem === item.id;

              return (
                <Link href={item.href} key={item.id}>
                  <motion.div
                    onClick={() => setActiveItem(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                      isActive
                        ? "bg-[var(--accent)] text-[var(--silver-light)] shadow-lg"
                        : "text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--silver)]"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconComponent />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-[var(--border)]">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-[var(--background-secondary)]">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--silver)] to-[var(--silver-dark)] rounded-full flex items-center justify-center">
                <span className="text-[var(--background)] font-semibold">
                  A
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[var(--foreground)] font-medium">
                  Διαχειριστής
                </p>
                <p className="text-[var(--foreground-muted)] text-sm">
                  admin@pnoh.com
                </p>
              </div>
              <button className="p-2 rounded-md hover:bg-[var(--accent)] text-[var(--foreground-muted)]">
                <Icons.Logout />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function TopBar({ onMenuClick }) {
  return (
    <header className="glass border-b border-[var(--border)] px-6 py-4 relative">
      {/* Mobile menu button absolutely positioned on the left */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md hover:bg-[var(--accent)] text-[var(--foreground-secondary)] absolute left-6 top-1/2 -translate-y-1/2"
        aria-label="Open menu"
      >
        <Icons.Menu />
      </button>
      {/* Centered title */}
      <div className="flex justify-center">
        <h1 className="text-xl font-semibold text-[var(--silver-light)] text-center w-full">
          Ταμπλό
        </h1>
      </div>
    </header>
  );
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar onMenuClick={toggleSidebar} />

        <main className="flex items-center justify-center flex-1 p-4 overflow-auto md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              {/* Welcome Section */}
              <motion.div
                className="mb-6 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <h1 className="text-3xl font-bold text-[var(--silver-light)] mb-1">
                  Καλώς ήρθες, Διαχειριστή
                </h1>
                <p className="text-[var(--foreground-muted)]">
                  Διαχειρίσου το κατάστημα σου εύκολα και γρήγορα.
                </p>
              </motion.div>

              {/* Centered rectangular action card */}
              <motion.div
                className="glass w-full max-w-2xl mx-auto p-10 rounded-2xl border border-[var(--border)] shadow-2xl text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-2xl md:text-3xl font-semibold text-[var(--silver-light)] mb-8">
                  Παρακαλώ επιλέξτε ενέργεια
                </h2>

                <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                  <a
                    href="/add-product"
                    className="w-full md:w-auto px-8 py-3 bg-[var(--accent)] text-[var(--silver-light)] rounded-lg shadow-md font-medium transition-transform hover:-translate-y-0.5"
                  >
                    Προσθήκη Προϊόντος
                  </a>

                  <a
                    href="/view-products"
                    className="w-full md:w-auto px-8 py-3 border border-[var(--border)] text-[var(--foreground)] rounded-lg font-medium bg-[rgba(255,255,255,0.02)] hover:bg-[var(--background-tertiary)] transition-colors"
                  >
                    Προβολή Προϊόντων
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
