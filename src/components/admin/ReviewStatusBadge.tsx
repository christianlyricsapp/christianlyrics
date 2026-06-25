import { getSongStatusLabel, type SongStatus } from "@/lib/admin-types";

const statusStyles: Record<SongStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  "needs-review": "bg-amber-100 text-amber-800",
  "changes-requested": "bg-orange-100 text-orange-800",
  approved: "bg-blue-100 text-blue-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-200 text-gray-600",
};

type ReviewStatusBadgeProps = {
  status: SongStatus;
};

export default function ReviewStatusBadge({ status }: ReviewStatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${statusStyles[status]}`}
    >
      {getSongStatusLabel(status)}
    </span>
  );
}
