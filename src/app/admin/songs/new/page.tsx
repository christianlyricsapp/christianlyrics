import type { Metadata } from "next";
import AdminLyricsWorkflow from "@/components/admin/AdminLyricsWorkflow";

export const metadata: Metadata = {
  title: "Add New Lyrics",
};

export default function NewSongPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
        Add New Lyrics
      </h1>
      <p className="mt-2 text-lg text-muted">
        Paste lyrics from your phone, auto-format, verify, then submit for
        review.
      </p>
      <div className="mt-6">
        <AdminLyricsWorkflow />
      </div>
    </div>
  );
}
