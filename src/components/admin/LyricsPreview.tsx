import { getCategoryName, getLanguageName } from "@/lib/demo-data";
import { getRightsStatusLabel, type RightsStatus } from "@/lib/admin-types";
import ReviewStatusBadge from "./ReviewStatusBadge";
import type { SongStatus } from "@/lib/admin-types";

type LyricsPreviewProps = {
  title: string;
  slug: string;
  categories: string[];
  language: string;
  lyrics: string;
  seoTitle: string;
  seoDescription: string;
  sourceUrl: string;
  rightsStatus: RightsStatus;
  status: SongStatus;
};

export default function LyricsPreview({
  title,
  slug,
  categories: selectedCategories,
  language,
  lyrics,
  seoTitle,
  seoDescription,
  sourceUrl,
  rightsStatus,
  status,
}: LyricsPreviewProps) {
  const categoryLabels = selectedCategories.map((slug) =>
    getCategoryName(slug)
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <p className="text-sm font-medium uppercase tracking-wide text-muted">
        Live Preview
      </p>

      {title ? (
        <h2 className="mt-3 text-2xl font-semibold text-foreground">{title}</h2>
      ) : (
        <p className="mt-3 text-lg text-muted italic">Song title will appear here</p>
      )}

      {slug && (
        <p className="mt-1 text-sm text-muted">/{slug}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <ReviewStatusBadge status={status} />
        {categoryLabels.map((label) => (
          <span
            key={label}
            className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
          >
            {label}
          </span>
        ))}
        {language && (
          <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-foreground">
            {getLanguageName(language)}
          </span>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-section p-4 sm:p-5">
        {lyrics ? (
          lyrics.split("\n").map((line, index) => (
            <p
              key={index}
              className={
                line.startsWith("[")
                  ? "mt-4 font-semibold text-primary first:mt-0"
                  : line === ""
                    ? "h-3"
                    : "text-base leading-relaxed text-foreground"
              }
            >
              {line}
            </p>
          ))
        ) : (
          <p className="text-base text-muted italic">
            Paste lyrics here to see a preview...
          </p>
        )}
      </div>

      {(seoTitle || seoDescription) && (
        <div className="mt-6 rounded-xl border border-dashed border-border p-4">
          <p className="text-xs font-medium uppercase text-muted">SEO Preview</p>
          {seoTitle && (
            <p className="mt-2 text-lg font-medium text-primary">{seoTitle}</p>
          )}
          {seoDescription && (
            <p className="mt-1 text-sm text-muted">{seoDescription}</p>
          )}
        </div>
      )}

      <div className="mt-4 space-y-1 text-sm text-muted">
        <p>
          <span className="font-medium text-foreground">Rights:</span>{" "}
          {getRightsStatusLabel(rightsStatus)}
        </p>
        {sourceUrl && (
          <p>
            <span className="font-medium text-foreground">Source:</span>{" "}
            {sourceUrl}
          </p>
        )}
      </div>
    </div>
  );
}
