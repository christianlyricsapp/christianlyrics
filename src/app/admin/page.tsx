"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-store";

export default function AdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    isAdminLoggedIn().then((loggedIn) => {
      if (loggedIn) {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/admin/login");
      }
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-lg text-muted">Redirecting...</p>
    </div>
  );
}
