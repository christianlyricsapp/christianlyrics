"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/admin-store";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    adminLogin(email.trim(), password).then((success) => {
      if (success) {
        router.push("/admin/dashboard");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#051224] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[rgba(199,157,79,0.25)] bg-[rgba(10,37,64,0.45)] backdrop-blur-md p-6 shadow-xl sm:p-8">
        <h1 className="text-center text-2xl font-extrabold text-white sm:text-3xl">
          Admin Login
        </h1>
        <p className="mt-2 text-center text-base text-[var(--accent)] font-semibold">
          Christian Lyrics Admin Panel
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-base font-medium text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@christianlyrics.app"
              autoComplete="email"
              className="form-input-premium w-full rounded-xl px-4 py-3 text-lg"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-base font-medium text-white"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              className="form-input-premium w-full rounded-xl px-4 py-3 text-lg"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-950/40 border border-red-800 px-4 py-3 text-base text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-4 py-3.5 text-lg font-bold text-[#051224] transition-all cursor-pointer shadow-lg shadow-gold/10"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[rgba(255,255,255,0.6)] space-y-1">
          <p>Admin demo: <span className="text-[var(--accent)]">admin@christianlyrics.app</span> / <span className="text-white">admin123</span></p>
          <p>Volunteer demo: <span className="text-[var(--accent)]">volunteer@christianlyrics.app</span> / <span className="text-white">volunteer123</span></p>
        </div>
      </div>
    </div>
  );
}
