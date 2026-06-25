import Link from "next/link";
import type { Category } from "@/lib/demo-data";

type CategoryCardProps = {
  category: Category;
};

const categoryGlows: Record<string, string> = {
  praise: "hover:shadow-[0_0_30px_rgba(251,191,36,0.12)]",
  worship: "hover:shadow-[0_0_30px_rgba(139,92,246,0.12)]",
  communion: "hover:shadow-[0_0_30px_rgba(236,72,153,0.12)]",
};

export default function CategoryCard({ category }: CategoryCardProps) {
  const glowClass = categoryGlows[category.slug] || "";

  return (
    <Link
      href={`/category/${category.slug}`}
      className={`gradient-border group block rounded-2xl p-6 text-center transition-all duration-300 hover:scale-[1.03] ${glowClass}`}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-4xl transition-all duration-300 group-hover:bg-surface-hover group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]">
        <span aria-hidden="true">{category.icon}</span>
      </div>
      <h3 className="mt-4 text-xl font-semibold transition-colors duration-200 group-hover:text-primary">
        <span className="gradient-text-violet">{category.name}</span>
      </h3>
      <p className="mt-2 text-base text-muted">{category.description}</p>
    </Link>
  );
}
