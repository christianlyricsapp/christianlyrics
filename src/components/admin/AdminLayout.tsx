"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAdminLoggedIn, updateVolunteerSessionHeartbeat } from "@/lib/admin-store";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setReady(true);
      return;
    }

    isAdminLoggedIn().then((loggedIn) => {
      if (!loggedIn) {
        router.replace("/admin/login");
      } else {
        setReady(true);
      }
    });
  }, [isLoginPage, router]);

  // Session activity tracker heartbeat
  useEffect(() => {
    if (!ready || isLoginPage) return;

    let activeThisMinute = false;

    function recordActivity() {
      activeThisMinute = true;
    }

    window.addEventListener("mousemove", recordActivity);
    window.addEventListener("keydown", recordActivity);
    window.addEventListener("click", recordActivity);
    window.addEventListener("scroll", recordActivity);
    window.addEventListener("touchstart", recordActivity);

    // Run heartbeat checker every 60 seconds
    const interval = setInterval(() => {
      if (activeThisMinute) {
        updateVolunteerSessionHeartbeat();
        activeThisMinute = false;
      }
    }, 60000);

    return () => {
      window.removeEventListener("mousemove", recordActivity);
      window.removeEventListener("keydown", recordActivity);
      window.removeEventListener("click", recordActivity);
      window.removeEventListener("scroll", recordActivity);
      window.removeEventListener("touchstart", recordActivity);
      clearInterval(interval);
    };
  }, [ready, isLoginPage]);

  if (isLoginPage) {
    return <div className="admin-theme min-h-screen bg-bg-page">{children}</div>;
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-lg text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-theme flex min-h-screen bg-bg-page text-foreground">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onMenuOpen={() => setSidebarOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
