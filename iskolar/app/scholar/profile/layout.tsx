import type { Metadata } from "next";
import "@/app/globals.css";
import ScholarSidebar from "@/app/components/ScholarSideBar";

export const metadata: Metadata = {
    title: "Profile | IskoLAR",
  description:
    "View and edit your profile information on IskoLAR.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      {/* Sidebar on the left */}
      <ScholarSidebar />

      {/* Page Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
