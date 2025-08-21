import ScholarSidebar from "@/app/components/ScholarSideBar";

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
