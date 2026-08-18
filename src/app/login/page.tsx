import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, isGoogleAuthEnabled } from "@/auth/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <AuthShell
      eyebrow="Node access"
      headline={
        <>
          Everything you
          <br />
          queued is still
          <br />
          <span className="text-frost-dim">here.</span>
        </>
      }
      statement="Jobs keep running whether or not you're watching. Sign in to pick up finished documents and anything still in flight."
      spec={[
        ["Session", "JWT"],
        ["Transport", "SSE"],
        ["Archive", "Permanent"],
      ]}
      footer={
        <>
          No account yet?{" "}
          <Link href="/register" className="draw inline-block text-flare">
            Open a node
          </Link>
        </>
      }
    >
      <LoginForm googleEnabled={isGoogleAuthEnabled} />
    </AuthShell>
  );
}