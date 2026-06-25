import { redirect } from "next/navigation";
import { languages } from "@/lib/demo-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return languages.map((lang) => ({
    slug: lang.slug,
  }));
}

export default async function LanguagePage({ params }: Props) {
  const { slug } = await params;
  redirect(`/?language=${slug}`);
}
