import { getSongStatusLabel, type SongStatus } from "@/lib/admin-types";

const statusStyles: Record<SongStatus, string> = {
  draft: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  "needs-review": "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  "changes-requested": "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  approved: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  published: "bg-green-500/10 text-green-400 border border-green-500/20",
  archived: "bg-slate-600/15 text-slate-500 border border-slate-600/20",
};

type ReviewStatusBadgeProps = {
  status: SongStatus;
};

export default function ReviewStatusBadge({ status }: ReviewStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${statusStyles[status]}`}
    >
      {getSongStatusLabel(status)}
    </span>
  );
}
