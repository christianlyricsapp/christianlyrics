import Link from "next/link";
import type { Language } from "@/lib/demo-data";

type LanguageCardProps = {
  language: Language;
};

export default function LanguageCard({ language }: LanguageCardProps) {
  return (
    <Link
      href={`/language/${language.slug}`}
      className="gradient-border glow-hover group block rounded-2xl p-6 text-center transition-all duration-300"
    >
      <h3 className="text-xl font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
        {language.name}
      </h3>
      <p className="mt-1 text-lg">
        <span className="gradient-text">{language.nativeName}</span>
      </p>
    </Link>
  );
}
