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
    <div className="flex min-h-screen items-center justify-center bg-section px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">
          Admin Login
        </h1>
        <p className="mt-2 text-center text-base text-muted">
          Christian Lyrics Admin Panel
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-base font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@christianlyrics.app"
              autoComplete="email"
              className="w-full rounded-xl border border-border px-4 py-3.5 text-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-base font-medium"
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
              className="w-full rounded-xl border border-border px-4 py-3.5 text-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-base text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-4 py-3.5 text-lg font-medium text-white transition-colors hover:bg-primary-light"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Demo login: admin@christianlyrics.app / admin123
        </p>
      </div>
    </div>
  );
}
