"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function LoginForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("That email and password don't match an account.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-8">
      <Field
        label="Email"
        index="01"
        id="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@domain.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Field
        label="Password"
        index="02"
        id="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p role="alert" className="label border-l-2 border-[color:var(--flare)] pl-3 text-flare">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Opening node…" : "Enter"}
      </Button>

      {googleEnabled && (
        <>
          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-[color:var(--line)]" />
            <span className="label text-frost-dim">or</span>
            <span className="h-px flex-1 bg-[color:var(--line)]" />
          </div>

          <Button
            type="button"
            variant="line"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Continue with Google
          </Button>
        </>
      )}
    </form>
  );
}