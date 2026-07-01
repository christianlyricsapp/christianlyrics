"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  getAdminSongs,
  getTrashedSongs,
  softDeleteSongs,
  restoreSongs,
  permanentDeleteSongs,
  updateSongsStatus,
  getAdminRole,
} from "@/lib/admin-store";
import { getCategoryName, getLanguageName } from "@/lib/demo-data";
import ReviewStatusBadge from "@/components/admin/ReviewStatusBadge";
import type { AdminSong } from "@/lib/admin-types";

type TabType = "draft" | "needs-review" | "published" | "all" | "trashed";

/* ── Password required for permanent delete ── */
const PERMANENT_DELETE_PASSWORD = "Sachin@786";

function formatFullPublishedDate(dateStr: string): string {
  const date = new Date(dateStr);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeStr = `${hours}:${minutes}${ampm}`;
  const day = date.getDate();
  let suffix = "th";
  if (day === 1 || day === 21 || day === 31) suffix = "st";
  else if (day === 2 || day === 22) suffix = "nd";
  else if (day === 3 || day === 23) suffix = "rd";
  const dayStr = `${day}${suffix}`;
  const monthName = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();
  return `${timeStr} ${dayStr} ${monthName} ${year}`;
}

export default function AdminSongsList() {
  const [songs, setSongs] = useState<AdminSong[]>([]);
  const [trashedSongs, setTrashedSongs] = useState<AdminSong[]>([]);
  const [tab, setTab] = useState<TabType>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [role, setRole] = useState<"admin" | "volunteer">("volunteer");

  // Confirm dialogs
  const [showTrashConfirm, setShowTrashConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const loadData = useCallback(async () => {
    const [activeSongs, trashed] = await Promise.all([
      getAdminSongs(),
      getTrashedSongs(),
    ]);
    setSongs(activeSongs);
    setTrashedSongs(trashed);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    getAdminRole().then(setRole);
  }, []);

  async function handleBulkApprove() {
    setIsProcessing(true);
    const ok = await updateSongsStatus(Array.from(selected), "approved");
    if (ok) {
      setSelected(new Set());
      await loadData();
    }
    setIsProcessing(false);
  }

  async function handleBulkPublish() {
    setIsProcessing(true);
    const ok = await updateSongsStatus(Array.from(selected), "published");
    if (ok) {
      setSelected(new Set());
      await loadData();
    }
    setIsProcessing(false);
  }

  async function handleSingleStatusChange(songId: string, status: "approved" | "published") {
    setIsProcessing(true);
    const ok = await updateSongsStatus([songId], status);
    if (ok) {
      await loadData();
    }
    setIsProcessing(false);
  }

  // Clear selection on tab change
  useEffect(() => {
    setSelected(new Set());
  }, [tab]);

  const filteredSongs = useMemo(() => {
    if (tab === "trashed") return trashedSongs;
    if (tab === "all") return songs;
    return songs.filter((s) => s.status === tab);
  }, [songs, trashedSongs, tab]);

  const tabs: { key: TabType; label: string; icon?: string }[] = [
    { key: "draft", label: "Drafts" },
    { key: "needs-review", label: "Review Queue ⏳" },
    { key: "published", label: "Published" },
    { key: "all", label: "All Songs" },
    { key: "trashed", label: "Recycle Bin 🗑️" },
  ];

  function getTabCount(key: TabType): number {
    if (key === "trashed") return trashedSongs.length;
    if (key === "all") return songs.length;
    return songs.filter((s) => s.status === key).length;
  }

  // ── Selection helpers ──
  function toggleSelectAll() {
    if (selected.size === filteredSongs.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredSongs.map((s) => s.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Actions ──
  async function handleMoveToTrash() {
    setIsProcessing(true);
    const ok = await softDeleteSongs(Array.from(selected));
    if (ok) {
      setShowTrashConfirm(false);
      setSelected(new Set());
      await loadData();
    }
    setIsProcessing(false);
  }

  async function handleRestore() {
    setIsProcessing(true);
    const ok = await restoreSongs(Array.from(selected));
    if (ok) {
      setShowRestoreConfirm(false);
      setSelected(new Set());
      await loadData();
    }
    setIsProcessing(false);
  }

  async function handlePermanentDelete() {
    if (deletePassword !== PERMANENT_DELETE_PASSWORD) {
      setPasswordError("Incorrect password. Only Sachin can permanently delete songs.");
      return;
    }
    setIsProcessing(true);
    const ok = await permanentDeleteSongs(Array.from(selected));
    if (ok) {
      setShowPermanentDeleteModal(false);
      setDeletePassword("");
      setPasswordError("");
      setSelected(new Set());
      await loadData();
    }
    setIsProcessing(false);
  }

  const hasNeedsReviewSelected = useMemo(() => {
    return Array.from(selected).some((id) => {
      const song = songs.find((s) => s.id === id);
      return song && song.status === "needs-review";
    });
  }, [selected, songs]);

  const hasApprovedSelected = useMemo(() => {
    return Array.from(selected).some((id) => {
      const song = songs.find((s) => s.id === id);
      return song && song.status === "approved";
    });
  }, [selected, songs]);

  const selectedCount = selected.size;
  const isTrashView = tab === "trashed";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Songs
          </h1>
          <p className="mt-2 text-lg text-muted">
            {songs.length} song{songs.length !== 1 ? "s" : ""} in your library
            {trashedSongs.length > 0 && (
              <span className="text-sm"> · {trashedSongs.length} in recycle bin</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/songs/import"
            className="rounded-xl border border-[rgba(199,157,79,0.3)] bg-[rgba(10,37,64,0.35)] px-5 py-3 text-base font-medium text-white transition-colors hover:border-[var(--accent)] hover:bg-[rgba(10,37,64,0.6)] cursor-pointer"
          >
            Bulk Import (Docs/PDFs/PPTs)
          </Link>
          <Link
            href="/admin/songs/new"
            className="rounded-xl bg-primary px-5 py-3 text-base font-medium text-white transition-colors hover:bg-primary-light"
          >
            Add New
          </Link>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="mt-8 flex flex-wrap border-b border-border gap-1">
        {tabs.map((t) => {
          const count = getTabCount(t.key);
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`border-b-2 px-4 py-2.5 text-base font-medium transition-colors ${
                active
                  ? t.key === "trashed"
                    ? "border-red-500 text-red-500"
                    : "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Selection Action Bar ── */}
      {selectedCount > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-section px-4 py-3 animate-fade-in">
          <span className="text-sm font-semibold text-foreground">
            {selectedCount} selected
          </span>
          <div className="ml-auto flex gap-2">
            {isTrashView ? (
              <>
                <button
                  onClick={() => setShowRestoreConfirm(true)}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  ♻️ Restore
                </button>
                <button
                  onClick={() => {
                    setShowPermanentDeleteModal(true);
                    setDeletePassword("");
                    setPasswordError("");
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  🗑️ Delete Permanently
                </button>
              </>
            ) : (
              <>
                {role === "admin" && (
                  <>
                    {hasNeedsReviewSelected && (
                      <button
                        onClick={handleBulkApprove}
                        disabled={isProcessing}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 cursor-pointer disabled:opacity-55"
                      >
                        👍 Approve Selected
                      </button>
                    )}
                    {hasApprovedSelected && (
                      <button
                        onClick={handleBulkPublish}
                        disabled={isProcessing}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 cursor-pointer disabled:opacity-55"
                      >
                        🚀 Publish Selected
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => setShowTrashConfirm(true)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  🗑️ Move to Recycle Bin
                </button>
              </>
            )}
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-card"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {filteredSongs.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-section">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      filteredSongs.length > 0 &&
                      selected.size === filteredSongs.length
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
                  />
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  #
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  Song Name
                </th>
                <th className="hidden whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted md:table-cell">
                  Category
                </th>
                <th className="hidden whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted lg:table-cell">
                  Language
                </th>
                <th className="hidden whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted md:table-cell">
                  By
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  Status
                </th>
                <th className="hidden whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted sm:table-cell">
                  {isTrashView ? "Deleted" : "Published"}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSongs.map((song, index) => {
                const categoryLabels = song.categories
                  .map((c) => getCategoryName(c))
                  .join(", ");
                const isSelected = selected.has(song.id);
                return (
                  <tr
                    key={song.id}
                    className={`transition-colors ${
                      isSelected
                        ? "bg-primary/5"
                        : "hover:bg-section/60"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="w-10 px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(song.id)}
                        className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
                      />
                    </td>

                    {/* Serial Number */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-muted">
                      {index + 1}
                    </td>

                    {/* Song Name + Slug */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground">
                        {song.title}
                      </div>
                      <div className="mt-0.5 text-xs text-muted">
                        /{song.slug}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="hidden whitespace-nowrap px-4 py-3.5 text-sm text-foreground md:table-cell">
                      {categoryLabels || "—"}
                    </td>

                    {/* Language */}
                    <td className="hidden whitespace-nowrap px-4 py-3.5 text-sm text-foreground lg:table-cell">
                      {getLanguageName(song.language) || "—"}
                    </td>

                    {/* Created / Modified By */}
                    <td className="hidden whitespace-nowrap px-4 py-3.5 md:table-cell">
                      <span className="text-sm text-foreground">
                        {song.lastModifiedByName || song.createdByName || "—"}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <ReviewStatusBadge status={song.status} />
                    </td>

                    {/* Date Column */}
                    <td className="hidden whitespace-nowrap px-4 py-3.5 text-sm text-muted sm:table-cell">
                      {isTrashView && song.deletedAt
                        ? formatFullPublishedDate(song.deletedAt)
                        : song.status === "published"
                          ? formatFullPublishedDate(song.updatedAt)
                          : "—"}
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      {isTrashView ? (
                        <button
                          onClick={async () => {
                            const ok = await restoreSongs([song.id]);
                            if (ok) await loadData();
                          }}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                        >
                          Restore
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {role === "admin" && song.status === "needs-review" && (
                            <button
                              onClick={() => handleSingleStatusChange(song.id, "approved")}
                              disabled={isProcessing}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 cursor-pointer disabled:opacity-55"
                            >
                              Approve
                            </button>
                          )}
                          {role === "admin" && song.status === "approved" && (
                            <button
                              onClick={() => handleSingleStatusChange(song.id, "published")}
                              disabled={isProcessing}
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 cursor-pointer disabled:opacity-55"
                            >
                              Publish
                            </button>
                          )}
                          <Link
                            href={`/admin/songs/edit?id=${song.id}`}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-light"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/admin/songs/edit?id=${song.id}&preview=1`}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-section"
                          >
                            Preview
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <p className="text-4xl" aria-hidden="true">
            {isTrashView ? "🗑️" : "🎵"}
          </p>
          <h2 className="mt-4 text-xl font-semibold">
            {isTrashView ? "Recycle bin is empty" : "No songs found"}
          </h2>
          <p className="mt-2 text-lg text-muted">
            {isTrashView
              ? "Deleted songs will appear here for review before permanent removal."
              : tab === "all"
                ? "Add your first song by pasting lyrics from your phone."
                : "No songs match this status."}
          </p>
          {tab === "all" && (
            <Link
              href="/admin/songs/new"
              className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-light"
            >
              Add New Lyrics
            </Link>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: Confirm Move to Recycle Bin
         ══════════════════════════════════════════════════════════════ */}
      {showTrashConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">
              Move to Recycle Bin?
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              {selectedCount} song{selectedCount !== 1 ? "s" : ""} will be moved
              to the recycle bin. You can restore them later.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowTrashConfirm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-section"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveToTrash}
                disabled={isProcessing}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? "Moving..." : "Move to Bin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: Confirm Restore
         ══════════════════════════════════════════════════════════════ */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">
              Restore Songs?
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              {selectedCount} song{selectedCount !== 1 ? "s" : ""} will be
              restored back to the songs library with their original status.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-section"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                disabled={isProcessing}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {isProcessing ? "Restoring..." : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: Password-Protected Permanent Delete
         ══════════════════════════════════════════════════════════════ */}
      {showPermanentDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-red-500">
              ⚠️ Permanent Delete
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              This will <strong className="text-red-400">permanently</strong>{" "}
              delete {selectedCount} song{selectedCount !== 1 ? "s" : ""}. This
              action cannot be undone.
            </p>
            <p className="mt-3 text-sm text-muted">
              Only <strong className="text-foreground">Sachin</strong> is
              authorized. Enter your password to proceed:
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value);
                setPasswordError("");
              }}
              placeholder="Enter password"
              className="mt-3 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePermanentDelete();
              }}
            />
            {passwordError && (
              <p className="mt-2 text-sm font-medium text-red-500">
                {passwordError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPermanentDeleteModal(false);
                  setDeletePassword("");
                  setPasswordError("");
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-section"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDelete}
                disabled={isProcessing || !deletePassword}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
