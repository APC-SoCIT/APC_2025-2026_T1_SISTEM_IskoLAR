import type { Metadata } from "next";
import AuthLayout from "./auth-layout";
import "@/app/globals.css";

export const metadata: Metadata = {
    title: "Sign In | IskoLAR",
    description: "Sign in to your IskoLAR account.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}