'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/scholar/profile');
    }
  }, [isLoading, isAuthenticated, router]);

  // Only render children if not authenticated
  if (isLoading) return null;
  if (isAuthenticated) return null;
  return children;
}