import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
    title: "Register | IskoLAR",
  description:
    "Create your IskoLAR account.",
};


export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}