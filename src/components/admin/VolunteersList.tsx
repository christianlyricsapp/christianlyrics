"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getVolunteerStats, toggleVolunteerStatus } from "@/lib/admin-store";
import type { VolunteerStats } from "@/lib/admin-types";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VolunteersList() {
  const [volunteers, setVolunteers] = useState<VolunteerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVolunteers();
  }, []);

  function loadVolunteers() {
    setLoading(true);
    getVolunteerStats().then((data) => {
      setVolunteers(data);
      setLoading(false);
    });
  }

  function handleToggleStatus(id: string, currentStatus: "active" | "inactive") {
    toggleVolunteerStatus(id, currentStatus).then((success) => {
      if (success) {
        loadVolunteers();
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Volunteers
          </h1>
          <p className="mt-2 text-lg text-muted">
            Track volunteer activity and lyrics contribution metrics.
          </p>
        </div>
        <Link
          href="/admin/volunteers/new"
          className="rounded-xl bg-primary px-5 py-3 text-base font-medium text-white transition-colors hover:bg-primary-light"
        >
          Add Volunteer
        </Link>
      </div>

      {loading ? (
        <div className="mt-8 text-center text-lg text-muted">
          Loading volunteer statistics...
        </div>
      ) : volunteers.length > 0 ? (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-section text-sm font-semibold text-muted">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Uploads</th>
                  <th className="px-6 py-4 text-center">Time Active</th>
                  <th className="px-6 py-4">Last Activity</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-base">
                {volunteers.map((vol) => (
                  <tr key={vol.id} className="hover:bg-section/50">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {vol.name}
                    </td>
                    <td className="px-6 py-4 text-muted break-all">
                      {vol.email}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          vol.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {vol.status === "active" ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-foreground">
                      {vol.totalUploads}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-foreground">
                      {formatDuration(vol.totalDurationMinutes)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {formatDate(vol.lastActive)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(vol.id, vol.status)}
                        className={`text-sm font-semibold transition-colors focus:outline-none ${
                          vol.status === "active"
                            ? "text-red-600 hover:text-red-700"
                            : "text-green-600 hover:text-green-700"
                        }`}
                      >
                        {vol.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <p className="text-4xl" aria-hidden="true">
            👥
          </p>
          <h2 className="mt-4 text-xl font-semibold">No volunteers yet</h2>
          <p className="mt-2 text-lg text-muted">
            Add a volunteer ID to let others upload and format lyrics.
          </p>
          <Link
            href="/admin/volunteers/new"
            className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-light"
          >
            Add New Volunteer
          </Link>
        </div>
      )}
    </div>
  );
}
