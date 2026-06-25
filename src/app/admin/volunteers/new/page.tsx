import type { Metadata } from "next";
import NewVolunteerForm from "@/components/admin/NewVolunteerForm";

export const metadata: Metadata = {
  title: "Create Volunteer ID",
};

export default function NewVolunteerPage() {
  return <NewVolunteerForm />;
}
