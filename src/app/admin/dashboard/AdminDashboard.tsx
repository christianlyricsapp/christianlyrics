"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminStats, getAdminRole, triggerRebuild, getLoggedInUserName } from "@/lib/admin-store";
import type { AdminStats } from "@/lib/admin-types";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    published: 0,
    draft: 0,
    needsReview: 0,
  });
  const [role, setRole] = useState<"admin" | "volunteer">("volunteer");
  const [userName, setUserName] = useState("");
  const [rebuildStatus, setRebuildStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    getAdminRole().then(setRole);
    getAdminStats().then(setStats);
    setUserName(getLoggedInUserName());
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
            {userName ? `${userName}'s Dashboard` : role === "admin" ? "Admin Dashboard" : "Volunteer Dashboard"}
          </h1>
          <p className="mt-2 text-base text-muted">
            {role === "admin"
              ? `Welcome back, ${userName || "Admin"}! Manage your Christian Lyrics library.`
              : `Welcome, ${userName || "Volunteer"}! Thank you for contributing.`}
          </p>
        </div>

        {/* Publish Live Button (Admins only) */}
        {role === "admin" && (
          <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-1.5">
            <button
              onClick={handlePublish}
              disabled={rebuildStatus === "loading"}
              className={`rounded-xl px-5 py-3 text-base font-bold transition-all focus:outline-none focus:ring-2 focus:ring-gold/20 cursor-pointer shadow-lg w-full md:w-auto ${
                rebuildStatus === "loading"
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : rebuildStatus === "success"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : rebuildStatus === "error"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#051224]"
              }`}
            >
              {rebuildStatus === "loading" && "⏳ Triggering Rebuild..."}
              {rebuildStatus === "success" && "🚀 Live Update Dispatched!"}
              {rebuildStatus === "error" && "❌ Failed to Trigger"}
              {rebuildStatus === "idle" && "📢 Publish Changes Live"}
            </button>
            <span className="text-xs text-muted text-left md:text-right">
              {rebuildStatus === "idle" && "Already live for users! Click to update static HTML for Google/SEO."}
              {rebuildStatus === "loading" && "Connecting to rebuild pipeline..."}
              {rebuildStatus === "success" && "SEO update running. (Song changes are already live for users!)"}
            </span>
          </div>
        )}
      </div>

      {/* Stats Cards (Admins only) */}
      {role === "admin" && (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 animate-fade-in">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-[rgba(199,157,79,0.15)] bg-[rgba(10,37,64,0.45)] backdrop-blur-md p-5 shadow-sm"
            >
              <p className="text-sm text-muted">{card.label}</p>
              <p className={`mt-2 text-2xl font-bold ${card.color}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Volunteer Welcome Card */}
      {role === "volunteer" && (
        <div className="mt-8 rounded-2xl border border-[rgba(199,157,79,0.15)] bg-[rgba(10,37,64,0.45)] backdrop-blur-md p-6 shadow-sm animate-fade-in">
          <h2 className="text-xl font-bold text-white">Thank you for contributing! 🎵</h2>
          <p className="mt-2 text-base text-muted leading-relaxed">
            Your volunteer account lets you paste and format new lyrics directly from your mobile phone.
            Once you submit a song, our administrators will review, correct, and publish it live to the website!
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/admin/songs/new"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-6 py-4 text-lg font-bold text-[#051224] transition-all shadow-lg shadow-gold/10 sm:w-auto active:scale-95 cursor-pointer"
        >
          ➕ Add New Lyrics
        </Link>
        <Link
          href="/admin/songs/import"
          className="inline-flex w-full items-center justify-center rounded-xl border border-[rgba(199,157,79,0.3)] bg-[rgba(10,37,64,0.35)] backdrop-blur-md px-6 py-4 text-lg font-bold text-white transition-all shadow-lg hover:border-[var(--accent)] hover:bg-[rgba(10,37,64,0.6)] sm:w-auto active:scale-95 cursor-pointer"
        >
          📦 Bulk Import (Docs/PDFs/PPTs)
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/songs"
          className="group rounded-2xl border border-[rgba(199,157,79,0.15)] bg-[rgba(10,37,64,0.45)] backdrop-blur-md p-6 transition-all hover:border-[var(--accent)] hover:bg-[#0A2540] hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-between"
        >
          <div>
            <p className="text-xl font-bold text-white group-hover:text-[var(--accent)] transition-colors">
              📂 {role === "admin" ? "Manage Songs" : "View My Submissions"}
            </p>
            <p className="mt-2 text-base text-muted leading-relaxed">
              {role === "admin"
                ? "View, edit, and preview all library songs."
                : "See status of songs submitted for review."}
            </p>
          </div>
          <span className="text-2xl text-muted group-hover:translate-x-1 group-hover:text-[var(--accent)] transition-all ml-4">→</span>
        </Link>
        <Link
          href="/admin/songs/new"
          className="group rounded-2xl border border-[rgba(199,157,79,0.15)] bg-[rgba(10,37,64,0.45)] backdrop-blur-md p-6 transition-all hover:border-[var(--accent)] hover:bg-[#0A2540] hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-between"
        >
          <div>
            <p className="text-xl font-bold text-white group-hover:text-[var(--accent)] transition-colors">
              ⚡ Quick Add Lyrics
            </p>
            <p className="mt-2 text-base text-muted leading-relaxed">
              Paste lyrics from your phone and save.
            </p>
          </div>
          <span className="text-2xl text-muted group-hover:translate-x-1 group-hover:text-[var(--accent)] transition-all ml-4">→</span>
        </Link>
      </div>
    </div>
  );
}
