"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVolunteer } from "@/lib/admin-store";

export default function NewVolunteerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !passcode.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setSaving(true);
    createVolunteer(name.trim(), email.trim(), passcode).then((success) => {
      setSaving(false);
      if (success) {
        router.push("/admin/volunteers");
      } else {
        setError("Failed to create volunteer. Email might already be registered.");
      }
    });
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-card px-4 py-3.5 text-lg text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
  const labelClass = "mb-2 block text-base font-medium text-foreground";

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
        Add New Volunteer
      </h1>
      <p className="mt-2 text-lg text-muted">
        Create credentials for a new lyrics volunteer helper.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="vol-name" className={labelClass}>
            Volunteer Name <span className="text-red-500">*</span>
          </label>
          <input
            id="vol-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="vol-email" className={labelClass}>
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="vol-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="vol-passcode" className={labelClass}>
            Login Passcode / Password <span className="text-red-500">*</span>
          </label>
          <input
            id="vol-passcode"
            type="text"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Choose a simple passcode"
            className={inputClass}
          />
          <p className="mt-1.5 text-sm text-muted">
            The volunteer will use this email and passcode to access their portal.
          </p>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-base text-red-700">
            {error}
          </p>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-primary px-6 py-3.5 text-base font-medium text-white transition-colors hover:bg-primary-light disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Volunteer"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/volunteers")}
            className="rounded-xl border border-border bg-card px-6 py-3.5 text-base font-medium transition-colors hover:bg-section"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
