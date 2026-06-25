"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import EmptyState from "./EmptyState";
import SearchBar from "./SearchBar";
import SongCard from "./SongCard";
import {
  categories,
  languages,
  songs,
  type Song,
} from "@/lib/demo-data";

export default function SongsList() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");

  const filteredSongs = useMemo(() => {
    const query = initialQuery.toLowerCase().trim();

    return songs.filter((song: Song) => {
      const matchesQuery =
        !query ||
        song.title.toLowerCase().includes(query) ||
        song.excerpt.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "all" || song.category === categoryFilter;

      const matchesLanguage =
        languageFilter === "all" || song.language === languageFilter;

      return matchesQuery && matchesCategory && matchesLanguage;
    });
  }, [initialQuery, categoryFilter, languageFilter]);

  return (
    <div>
      <SearchBar defaultValue={initialQuery} />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label
            htmlFor="category-filter"
            className="mb-2 block text-base font-medium text-foreground-dim"
          >
            Category
          </label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="glass-input w-full rounded-xl px-4 py-3 text-base text-foreground"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label
            htmlFor="language-filter"
            className="mb-2 block text-base font-medium text-foreground-dim"
          >
            Language
          </label>
          <select
            id="language-filter"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="glass-input w-full rounded-xl px-4 py-3 text-base text-foreground"
          >
            <option value="all">All languages</option>
            {languages.map((lang) => (
              <option key={lang.slug} value={lang.slug}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-6 text-base text-muted">
        {filteredSongs.length} song{filteredSongs.length !== 1 ? "s" : ""} found
      </p>

      {filteredSongs.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {filteredSongs.map((song, i) => (
            <div
              key={song.slug}
              className={`animate-fade-in stagger-${Math.min(i + 1, 8)}`}
            >
              <SongCard song={song} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="No songs found"
            message="Try a different search term or filter."
            actionLabel="View all songs"
            actionHref="/songs"
          />
        </div>
      )}
    </div>
  );
}
