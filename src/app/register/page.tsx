import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, isGoogleAuthEnabled } from "@/auth/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <AuthShell
      eyebrow="Node registration"
      headline={
        <>
          Three agents,
          <br />
          one document,
          <br />
          <span className="text-frost-dim">zero waiting.</span>
        </>
      }
      statement="Create an account and your first query can be queued in under a minute. Every report you generate is archived against your account and stays searchable."
      spec={[
        ["Agents", "03"],
        ["Cost", "Free to start"],
        ["Format", "Markdown"],
      ]}
      footer={
        <>
          Already have one?{" "}
          <Link href="/login" className="draw inline-block text-flare">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm googleEnabled={isGoogleAuthEnabled} />
    </AuthShell>
  );
}