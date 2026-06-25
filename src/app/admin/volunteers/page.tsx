import type { Metadata } from "next";
import VolunteersList from "@/components/admin/VolunteersList";

export const metadata: Metadata = {
  title: "Manage Volunteers",
};

export default function VolunteersPage() {
  return <VolunteersList />;
}
