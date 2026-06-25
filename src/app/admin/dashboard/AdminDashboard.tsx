"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminStats, getAdminRole, triggerRebuild } from "@/lib/admin-store";
import type { AdminStats } from "@/lib/admin-types";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    published: 0,
    draft: 0,
    needsReview: 0,
  });
  const [role, setRole] = useState<"admin" | "volunteer">("volunteer");
  const [rebuildStatus, setRebuildStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    getAdminRole().then(setRole);
    getAdminStats().then(setStats);
  }, []);

  async function handlePublish() {
    setRebuildStatus("loading");
    const success = await triggerRebuild();
    if (success) {
      setRebuildStatus("success");
      setTimeout(() => setRebuildStatus("idle"), 5000);
    } else {
      setRebuildStatus("error");
      setTimeout(() => setRebuildStatus("idle"), 5000);
    }
  }

  const statCards = [
    { label: "Total Songs", value: stats.total, color: "text-foreground" },
    { label: "Published", value: stats.published, color: "text-green-400" },
    { label: "Drafts", value: stats.draft, color: "text-muted" },
    { label: "Needs Review", value: stats.needsReview, color: "text-amber-400" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {role === "admin" ? "Admin Dashboard" : "Volunteer Dashboard"}
          </h1>
          <p className="mt-2 text-lg text-muted">
            {role === "admin"
              ? "Welcome to the Christian Lyrics admin panel."
              : "Welcome to the Christian Lyrics Volunteer Portal."}
          </p>
        </div>

        {/* Publish Live Button (Admins only) */}
        {role === "admin" && (
          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={handlePublish}
              disabled={rebuildStatus === "loading"}
              className={`rounded-xl px-5 py-3 text-base font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                rebuildStatus === "loading"
                  ? "bg-muted cursor-not-allowed text-foreground/50"
                  : rebuildStatus === "success"
                    ? "bg-green-600 hover:bg-green-700"
                    : rebuildStatus === "error"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-primary hover:bg-primary-light"
              }`}
            >
              {rebuildStatus === "loading" && "⏳ Triggering Rebuild..."}
              {rebuildStatus === "success" && "🚀 Live Update Dispatched!"}
              {rebuildStatus === "error" && "❌ Failed to Trigger"}
              {rebuildStatus === "idle" && "📢 Publish Changes Live"}
            </button>
            <span className="text-xs text-muted text-right">
              {rebuildStatus === "idle" && "Pre-renders database edits to Hostinger"}
              {rebuildStatus === "loading" && "Connecting to rebuild pipeline..."}
              {rebuildStatus === "success" && "Rebuild running. Live in 1 minute!"}
            </span>
          </div>
        )}
      </div>

      {/* Stats Cards (Admins only) */}
      {role === "admin" && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <p className="text-base text-muted">{card.label}</p>
              <p className={`mt-2 text-3xl font-semibold ${card.color}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Volunteer Welcome Card */}
      {role === "volunteer" && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm animate-fade-in">
          <h2 className="text-xl font-semibold text-foreground">Thank you for contributing! 🎵</h2>
          <p className="mt-2 text-base text-muted leading-relaxed">
            Your volunteer account lets you paste and format new lyrics directly from your mobile phone.
            Once you submit a song, our administrators will review, correct, and publish it live to the website!
          </p>
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/admin/songs/new"
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary-light px-6 py-4 text-lg font-bold text-white transition-opacity hover:opacity-95 shadow-md shadow-primary/20 sm:w-auto active:scale-95 cursor-pointer"
        >
          ➕ Add New Lyrics
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/songs"
          className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:bg-section hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-between"
        >
          <div>
            <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              📂 {role === "admin" ? "Manage Songs" : "View My Submissions"}
            </p>
            <p className="mt-2 text-base text-muted leading-relaxed">
              {role === "admin"
                ? "View, edit, and preview all library songs."
                : "See status of songs submitted for review."}
            </p>
          </div>
          <span className="text-2xl text-muted group-hover:translate-x-1 group-hover:text-primary transition-all ml-4">→</span>
        </Link>
        <Link
          href="/admin/songs/new"
          className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:bg-section hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-between"
        >
          <div>
            <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              ⚡ Quick Add Lyrics
            </p>
            <p className="mt-2 text-base text-muted leading-relaxed">
              Paste lyrics from your phone and save.
            </p>
          </div>
          <span className="text-2xl text-muted group-hover:translate-x-1 group-hover:text-primary transition-all ml-4">→</span>
        </Link>
      </div>
    </div>
  );
}
