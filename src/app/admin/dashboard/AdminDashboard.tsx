"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminStats, getAdminRole, triggerRebuild, getLoggedInUserName } from "@/lib/admin-store";
import type { AdminStats } from "@/lib/admin-types";
import { getSongStatusLabel } from "@/lib/admin-types";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    published: 0,
    draft: 0,
    needsReview: 0,
    totalCategories: 0,
    totalArtists: 0,
    recentSongs: [],
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
    { label: "Total Songs", value: stats.total, colorClass: "text-primary", bgClass: "bg-primary/5", icon: "🎵" },
    { label: "Published", value: stats.published, colorClass: "text-green-600", bgClass: "bg-green-50", icon: "✅" },
    { label: "Drafts", value: stats.draft, colorClass: "text-muted", bgClass: "bg-section", icon: "📝" },
    { label: "Needs Review", value: stats.needsReview, colorClass: "text-amber-600", bgClass: "bg-amber-50", icon: "⏳" },
    { label: "Categories", value: stats.totalCategories, colorClass: "text-blue-600", bgClass: "bg-blue-50", icon: "📂" },
    { label: "Artists", value: stats.totalArtists, colorClass: "text-purple-600", bgClass: "bg-purple-50", icon: "🎤" },
  ];

  function statusBadge(status: string) {
    switch (status) {
      case "published": return "bg-green-100 text-green-700";
      case "draft": return "bg-slate-100 text-slate-600";
      case "needs-review": return "bg-amber-100 text-amber-700";
      case "approved": return "bg-blue-100 text-blue-700";
      default: return "bg-section text-muted";
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

      {/* ── Header Row ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            {userName ? `${userName}'s Dashboard` : role === "admin" ? "Admin Dashboard" : "Volunteer Dashboard"}
          </h1>
          <p className="mt-1.5 text-base text-muted">
            {role === "admin"
              ? `Welcome back, ${userName || "Admin"}! Manage your Christian Lyrics library.`
              : `Welcome, ${userName || "Volunteer"}! Thank you for contributing.`}
          </p>
        </div>

        {/* Publish Live Button — Admin only */}
        {role === "admin" && (
          <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-1.5">
            <button
              onClick={handlePublish}
              disabled={rebuildStatus === "loading"}
              className={`rounded-xl px-5 py-3 text-sm font-bold transition-all focus:outline-none focus:ring-2 cursor-pointer shadow-sm w-full md:w-auto border ${
                rebuildStatus === "loading"
                  ? "bg-section border-border text-muted cursor-not-allowed"
                  : rebuildStatus === "success"
                    ? "bg-green-600 border-green-600 hover:bg-green-700 text-white"
                    : rebuildStatus === "error"
                      ? "bg-red-600 border-red-600 hover:bg-red-700 text-white"
                      : "bg-primary border-primary hover:bg-primary-light text-white"
              }`}
            >
              {rebuildStatus === "loading" && "⏳ Triggering..."}
              {rebuildStatus === "success" && "🚀 Live Update Dispatched!"}
              {rebuildStatus === "error" && "❌ Failed — Try Again"}
              {rebuildStatus === "idle" && "📢 Publish Changes Live"}
            </button>
            <span className="text-xs text-muted text-left md:text-right">
              {rebuildStatus === "idle" && "Updates SEO/static HTML for Google."}
              {rebuildStatus === "loading" && "Connecting to rebuild pipeline..."}
              {rebuildStatus === "success" && "SEO update running. Song changes are already live!"}
            </span>
          </div>
        )}
      </div>

      {/* ── Stat Cards (Admin only) ── */}
      {role === "admin" && (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${card.bgClass}`}
            >
              <p className="text-sm text-muted flex items-center gap-2">
                <span>{card.icon}</span> {card.label}
              </p>
              <p className={`mt-2 text-2xl font-bold ${card.colorClass}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Volunteer Welcome Card ── */}
      {role === "volunteer" && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground">Thank you for contributing! 🎵</h2>
          <p className="mt-2 text-base text-muted leading-relaxed">
            Your volunteer account lets you paste and format new lyrics directly from your mobile phone.
            Once you submit a song, our administrators will review, correct, and publish it live to the website!
          </p>
        </div>
      )}

      {/* ── Quick Action Buttons ── */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/admin/songs/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent-hover px-6 py-3.5 text-base font-bold text-white transition-all shadow-sm sm:w-auto active:scale-95"
        >
          ➕ Add New Lyrics
        </Link>
        {role === "admin" && (
          <Link
            href="/admin/bulk-upload"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-section px-6 py-3.5 text-base font-semibold text-foreground transition-all shadow-sm sm:w-auto active:scale-95"
          >
            📄 Bulk Upload (.docx / .txt)
          </Link>
        )}
      </div>

      {/* ── Recent Songs (Admin only) ── */}
      {role === "admin" && stats.recentSongs.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Recent Songs</h2>
            <Link href="/admin/songs" className="text-sm font-medium text-accent hover:underline">
              View all →
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            {stats.recentSongs.map((song, i) => (
              <Link
                key={song.id}
                href={`/admin/songs/edit?id=${song.id}`}
                className={`flex items-center justify-between px-4 py-3 hover:bg-section transition-colors ${
                  i < stats.recentSongs.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-sm font-semibold text-foreground truncate">{song.title}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusBadge(song.status)}`}>
                    {getSongStatusLabel(song.status)}
                  </span>
                </div>
                <span className="text-xs font-bold text-accent ml-3 shrink-0">Edit →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Navigation Cards ── */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/songs"
          className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-md flex items-center justify-between shadow-sm active:scale-[0.98]"
        >
          <div>
            <p className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
              📂 {role === "admin" ? "Manage Songs" : "View My Submissions"}
            </p>
            <p className="mt-1.5 text-sm text-muted leading-relaxed">
              {role === "admin"
                ? "View, edit, and preview all library songs."
                : "See status of songs submitted for review."}
            </p>
          </div>
          <span className="text-xl text-muted group-hover:translate-x-1 group-hover:text-accent transition-all ml-4">→</span>
        </Link>
        <Link
          href="/admin/songs/new"
          className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-md flex items-center justify-between shadow-sm active:scale-[0.98]"
        >
          <div>
            <p className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
              ⚡ Quick Add Lyrics
            </p>
            <p className="mt-1.5 text-sm text-muted leading-relaxed">
              Paste lyrics from your phone and save.
            </p>
          </div>
          <span className="text-xl text-muted group-hover:translate-x-1 group-hover:text-accent transition-all ml-4">→</span>
        </Link>
      </div>
    </div>
  );
}
