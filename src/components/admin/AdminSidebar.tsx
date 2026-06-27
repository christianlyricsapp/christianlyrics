"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { getAdminRole } from "@/lib/admin-store";

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const normalizedPathname = pathname === "/" ? "/" : pathname?.replace(/\/$/, "");
  const [role, setRole] = useState<"admin" | "volunteer">("volunteer");

  useEffect(() => {
    getAdminRole().then(setRole);
  }, []);

  const navItems = useMemo(() => {
    if (role === "admin") {
      return [
        { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
        { href: "/admin/songs", label: "Songs", icon: "🎵" },
        { href: "/admin/songs/new", label: "Add Lyrics", icon: "➕" },
        { href: "/admin/songs/import", label: "Bulk Import", icon: "📦" },
        { href: "/admin/volunteers", label: "Volunteers", icon: "👥" },
      ];
    }
    return [
      { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/admin/songs", label: "My Submissions", icon: "🎵" },
      { href: "/admin/songs/new", label: "Add Lyrics", icon: "➕" },
      { href: "/admin/songs/import", label: "Bulk Import", icon: "📦" },
    ];
  }, [role]);

  function isActive(href: string) {
    const cleanHref = href === "/" ? "/" : href.replace(/\/$/, "");
    if (cleanHref === "/admin/dashboard") return normalizedPathname === cleanHref;
    if (cleanHref === "/admin/songs/new") return normalizedPathname === cleanHref;
    if (cleanHref === "/admin/songs/import") return normalizedPathname === cleanHref;
    if (cleanHref === "/admin/volunteers") return normalizedPathname.startsWith("/admin/volunteers");
    if (cleanHref === "/admin/songs") {
      return (
        normalizedPathname === "/admin/songs" ||
        (normalizedPathname.startsWith("/admin/songs/") && 
         !normalizedPathname.endsWith("/new") && 
         !normalizedPathname.endsWith("/import"))
      );
    }
    return normalizedPathname.startsWith(cleanHref);
  }

  const sidebarContent = (
    <nav className="flex flex-col gap-1 p-4" aria-label="Admin">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-colors ${
            isActive(item.href)
              ? "bg-[var(--accent)] text-[#051224] font-bold"
              : "text-foreground hover:bg-section"
          }`}
        >
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
        <div className="sticky top-0 p-4">
          <p className="px-4 font-serif text-lg font-semibold text-primary">
            {role === "admin" ? "Admin Panel" : "Volunteer Panel"}
          </p>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <p className="font-serif text-lg font-semibold text-primary">
                {role === "admin" ? "Admin Panel" : "Volunteer Panel"}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 hover:bg-section"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
