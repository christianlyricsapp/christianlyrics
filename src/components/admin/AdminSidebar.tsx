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
        { href: "/admin/bulk-upload", label: "Bulk Upload", icon: "📄" },
        { href: "/admin/volunteers", label: "Volunteers", icon: "👥" },
      ];
    }
    return [
      { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/admin/songs", label: "My Submissions", icon: "🎵" },
      { href: "/admin/songs/new", label: "Add Lyrics", icon: "➕" },
    ];
  }, [role]);

  function isActive(href: string) {
    const cleanHref = href === "/" ? "/" : href.replace(/\/$/, "");
    if (cleanHref === "/admin/dashboard") return normalizedPathname === cleanHref;
    if (cleanHref === "/admin/songs/new") return normalizedPathname === cleanHref;
    if (cleanHref === "/admin/bulk-upload") return normalizedPathname === cleanHref;
    if (cleanHref === "/admin/volunteers") return normalizedPathname.startsWith("/admin/volunteers");
    if (cleanHref === "/admin/songs") {
      return (
        normalizedPathname === "/admin/songs" ||
        (normalizedPathname.startsWith("/admin/songs/") &&
          !normalizedPathname.endsWith("/new"))
      );
    }
    return normalizedPathname.startsWith(cleanHref);
  }

  const sidebarContent = (
    <nav className="flex flex-col gap-0.5 p-3" aria-label="Admin">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive(item.href)
              ? "bg-primary text-white font-semibold"
              : "text-foreground hover:bg-section hover:text-primary"
          }`}
        >
          <span aria-hidden="true" className="text-base">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:block">
        <div className="sticky top-0">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">
              {role === "admin" ? "Admin Panel" : "Volunteer Panel"}
            </p>
          </div>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
            aria-label="Close menu"
          />
          {/* Drawer panel */}
          <aside className="absolute left-0 top-0 h-full w-64 bg-card shadow-xl border-r border-border flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <p className="text-sm font-bold text-primary">
                {role === "admin" ? "Admin Panel" : "Volunteer Panel"}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted hover:bg-section hover:text-foreground transition-colors"
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="h-4 w-4">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
