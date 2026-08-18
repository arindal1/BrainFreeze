"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function RegisterForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't create the account.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-8">
      <Field
        label="Name"
        index="01"
        id="name"
        autoComplete="name"
        required
        placeholder="What should we call you"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Field
        label="Email"
        index="02"
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
        index="03"
        id="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder="8 characters minimum"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p role="alert" className="label border-l-2 border-[color:var(--flare)] pl-3 text-flare">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Opening node…" : "Open the node"}
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