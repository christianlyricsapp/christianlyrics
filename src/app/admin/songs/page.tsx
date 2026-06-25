import type { Metadata } from "next";
import AdminSongsList from "./AdminSongsList";

export const metadata: Metadata = {
  title: "Songs",
};

export default function AdminSongsPage() {
  return <AdminSongsList />;
}
