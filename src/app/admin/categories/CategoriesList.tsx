"use client";

import { categories } from "@/lib/demo-data";

export default function CategoriesList() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Categories
          </h1>
          <p className="mt-2 text-base text-muted">
            {categories.length} categories in your library
          </p>
        </div>
      </div>

      <div className="mt-2 rounded-xl border border-[rgba(199,157,79,0.15)] bg-[rgba(10,37,64,0.25)] p-4 text-sm text-muted">
        💡 Categories are currently managed in the codebase. To add or edit categories, update <code className="text-[var(--accent)]">src/lib/demo-data.ts</code>.
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.slug}
            className="rounded-2xl border border-[rgba(199,157,79,0.15)] bg-[rgba(10,37,64,0.45)] backdrop-blur-md p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{cat.icon}</span>
              <div>
                <p className="text-lg font-bold text-white">{cat.name}</p>
                <p className="text-xs text-muted font-mono">/{cat.slug}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              {cat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
