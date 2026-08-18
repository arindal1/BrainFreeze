"use client";

import dynamic from "next/dynamic";
import { CryoFallback } from "@/components/three/CryoField";

const CryoField = dynamic(() => import("@/components/three/CryoField"), {
  ssr: false,
  loading: () => <CryoFallback />,
});

/** Client-only wrapper so server components (e.g. not-found.tsx) can render the field. */
export function CryoFieldBackdrop({ heat = 1 }: { heat?: number }) {
  return <CryoField heat={heat} />;
}