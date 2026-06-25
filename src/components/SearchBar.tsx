"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SearchBarProps = {
  placeholder?: string;
  defaultValue?: string;
  size?: "default" | "large";
};

export default function SearchBar({
  placeholder = "Search for a song...",
  defaultValue = "",
  size = "default",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/songs?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/songs");
    }
  }

  const sizeClasses =
    size === "large"
      ? "px-5 py-4 text-lg sm:text-xl"
      : "px-4 py-3 text-base sm:text-lg";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <label htmlFor="search" className="sr-only">
          Search songs
        </label>
        <input
          id="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`glass-input w-full rounded-2xl pr-14 text-foreground placeholder:text-muted ${sizeClasses}`}
        />
        <button
          type="submit"
          aria-label="Search"
          className="btn-glow absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-4 py-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </div>
    </form>
  );
}
