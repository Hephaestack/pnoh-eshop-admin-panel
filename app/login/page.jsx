"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const passwordRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const remembered = localStorage.getItem("rememberedCredentials");
      if (remembered) {
        const { username, password } = JSON.parse(remembered);
        setUsername(username);
        setPassword(password);
        setRememberMe(true);
      }
    }
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!username || !password) {
      setError(
        "Παρακαλώ εισάγετε το όνομα χρήστη και τον κωδικό πρόσβασής σας."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
          credentials: "include",
        }
      );

      setLoading(false);

      if (response.ok) {
        // Success: set isLoggedIn flag for admin-panel
        localStorage.setItem("isLoggedIn", "true");

        if (rememberMe) {
          localStorage.setItem(
            "rememberedCredentials",
            JSON.stringify({ username, password })
          );
        } else {
          localStorage.removeItem("rememberedCredentials");
        }

        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Λάθος όνομα χρήστη ή κωδικός πρόσβασης.");
      }
    } catch (err) {
      setLoading(false);
      setError("Σφάλμα διακομιστή. Παρακαλώ προσπαθήστε ξανά αργότερα.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-2 py-8 sm:px-4 bg-gradient-to-br from-[#0b0b0d] via-[#111214] to-[#1b1b1d]">
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center flex-1 w-full max-w-md"
      >
        <div className="flex flex-col items-center w-full px-6 py-8 bg-gradient-to-b from-[#161616] to-[#0f0f10] border border-[#2e2e2e] shadow-[0_10px_30px_rgba(0,0,0,0.7)] backdrop-blur-md rounded-3xl sm:px-8 sm:py-10">
          <div className="w-32 h-32 rounded-full flex items-center justify-center mb-5 bg-gradient-to-br from-[#2b2b2b] to-[#141414] ring-1 ring-[#3d3d3d] shadow-[inset_0_2px_6px_rgba(255,255,255,0.03)]">
            <img
              src="/Hephaestack-Logo.png"
              alt="Logo"
              className="object-cover w-32 h-24"
              style={{ background: "none" }}
            />
          </div>

          <h1 className="text-2xl mb-5 sm:text-3xl font-extrabold text-[#d7d7d7] text-center tracking-tight drop-shadow relative">
            Forging Solutions
            <motion.div
              initial={{ width: 0, left: "50%", x: "-50%" }}
              animate={{ width: "100%", left: "50%", x: "-50%" }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              style={{
                height: 3,
                background: "gray",
                position: "absolute",
                bottom: -8,
                borderRadius: 2,
              }}
            />
          </h1>

          <input
            type="text"
            placeholder="Όνομα Χρήστη"
            className="w-full text-[#dcdcdc] max-w-xs mb-3 px-4 py-2 rounded-xl border border-[#3a3a3a] bg-[#0b0b0b] focus:outline-none focus:ring-2 focus:ring-[#6b6b6b] placeholder:text-[#9a9a9a] placeholder:font-semibold"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                passwordRef.current && passwordRef.current.focus();
              }
            }}
          />

          <input
            type="password"
            placeholder="Κωδικός Πρόσβασης"
            className="w-full max-w-xs mb-3 text-[#dcdcdc] px-4 py-2 rounded-xl border border-[#3a3a3a] bg-[#0b0b0b] focus:outline-none focus:ring-2 focus:ring-[#6b6b6b] placeholder:text-[#9a9a9a] placeholder:font-semibold"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            ref={passwordRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleLogin();
              }
            }}
          />

          <label className="flex items-center w-full max-w-xs mb-5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe((v) => !v)}
              className="form-checkbox accent-[#9aa0a6] border-[#4a4a4a] mr-2"
              disabled={loading}
            />
            <span className="text-[#cfcfcf] font-semibold text-sm">
              Να με θυμάσαι
            </span>
          </label>

          {error && (
            <div className="w-full max-w-xs mb-4 text-center text-[#f1c0c0] bg-[#2b0f0f] border border-[#5a2020] rounded-xl px-3 py-2 font-semibold text-sm">
              {error}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            className="btn-primary bg-gradient-to-b from-[#3b3b3b] to-[#1f1f1f] text-[#e7e7e7] text-lg rounded-xl border border-[#444444] w-full max-w-xs px-4 py-2 font-semibold transition-colors duration-200 hover:from-[#4a4a4a] hover:to-[#262626] focus:outline-none focus:ring-2 focus:ring-[#6b6b6b] focus:ring-opacity-60"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Σύνδεση..." : "Σύνδεση"}
          </motion.button>
        </div>
      </motion.main>
    </div>
  );
}
