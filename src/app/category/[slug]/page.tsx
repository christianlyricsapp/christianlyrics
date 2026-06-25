import { redirect } from "next/navigation";
import { categories } from "@/lib/demo-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/?category=${slug}`);
}
