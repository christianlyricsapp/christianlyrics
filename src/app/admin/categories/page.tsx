import type { Metadata } from "next";
import CategoriesList from "./CategoriesList";

export const metadata: Metadata = {
  title: "Categories",
};

export default function CategoriesPage() {
  return <CategoriesList />;
}
