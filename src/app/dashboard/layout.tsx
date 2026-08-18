import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

// Private, auth-gated area: keep it out of search results entirely.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col">
      <DashboardNav userName={session.user.name ?? session.user.email ?? "Researcher"} />
      <main className="mx-auto w-full max-w-[90rem] flex-1 px-5 pt-36 pb-28 md:px-10 md:pt-32">
        {children}
      </main>
    </div>
  );
}