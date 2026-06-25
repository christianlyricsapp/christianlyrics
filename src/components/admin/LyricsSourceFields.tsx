import { RIGHTS_STATUSES, type RightsStatus } from "@/lib/admin-types";
import { canPublish } from "@/lib/admin-types";

export const inputClass =
  "w-full rounded-xl border border-border bg-card px-4 py-3.5 text-lg text-foreground transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export const labelClass = "mb-2 block text-base font-medium text-foreground";

export const helperClass = "mt-1.5 text-sm text-muted";

type LyricsSourceFieldsProps = {
  sourceUrl: string;
  rightsStatus: RightsStatus;
  onSourceUrlChange: (value: string) => void;
  onRightsStatusChange: (value: RightsStatus) => void;
};

export default function LyricsSourceFields({
  sourceUrl,
  rightsStatus,
  onSourceUrlChange,
  onRightsStatusChange,
}: LyricsSourceFieldsProps) {
  const publishBlocked = !canPublish(rightsStatus);

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="sourceUrl" className={labelClass}>
          Source Website / Link
        </label>
        <input
          id="sourceUrl"
          type="url"
          value={sourceUrl}
          onChange={(e) => onSourceUrlChange(e.target.value)}
          placeholder="https://example.com/song-source"
          className={inputClass}
        />
        <p className={helperClass}>
          Where the lyrics came from, if applicable.
        </p>
      </div>

      <div>
        <label htmlFor="rightsStatus" className={labelClass}>
          Rights / Permission Status
        </label>
        <select
          id="rightsStatus"
          value={rightsStatus}
          onChange={(e) =>
            onRightsStatusChange(e.target.value as RightsStatus)
          }
          className={inputClass}
        >
          {RIGHTS_STATUSES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        {publishBlocked && (
          <p className="mt-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Please verify that you have permission to publish these lyrics.
          </p>
        )}
      </div>
    </div>
  );
}
