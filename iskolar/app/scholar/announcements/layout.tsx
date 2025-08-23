import type { Metadata } from "next";
import "@/app/globals.css";
import ScholarSidebar from "@/app/components/ScholarSideBar";

export const metadata: Metadata = {
    title: "Announcements | IskoLAR",
  description:
    "Stay updated with the latest announcements from IskoLAR.",
};

export default function AnnouncementsLayout({
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
