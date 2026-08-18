"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, useScroll, useSpring } from "framer-motion";

type ResultResponse = {
  job: { id: string; query: string; status: string; completedAt: string | null };
  result: { title: string; markdown: string; durationMs: number | null } | null;
};

function duration(ms: number | null) {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function DocumentPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ResultResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  useEffect(() => {
    fetch(`/api/research/${params.id}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null));
  }, [params.id]);

  if (!data) return <p className="label text-frost-dim">Opening document…</p>;

  if (!data.result) {
    return (
      <div className="flex flex-col gap-6">
        <Link href="/dashboard" className="label draw inline-block w-fit text-frost-muted hover:text-frost">
          ← Console
        </Link>
        <p className="display text-[length:var(--step-2)] text-frost-dim">
          This run hasn&apos;t finished yet.
        </p>
      </div>
    );
  }

  const { result, job } = data;
  const markdown = result.markdown;

  async function copy() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function download() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.title.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const meta: [string, string][] = [
    ["Query", job.query],
    ["Agents", "3 of 3"],
    ["Run time", duration(result.durationMs)],
    [
      "Completed",
      job.completedAt
        ? new Date(job.completedAt).toLocaleString(undefined, {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
    ],
  ];

  return (
    <div className="flex flex-col gap-12">
      {/* Reading progress — a single hairline, nothing more */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-flare"
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/dashboard/completed" className="label draw inline-block text-frost-muted hover:text-frost">
          ← Ready to read
        </Link>
        <div className="flex items-center gap-6">
          <button onClick={copy} className="label draw inline-block text-frost-muted hover:text-flare">
            {copied ? "Copied" : "Copy markdown"}
          </button>
          <button onClick={download} className="label draw inline-block text-frost-muted hover:text-flare">
            Download .md
          </button>
        </div>
      </div>

      <header className="border-b border-[color:var(--line-strong)] pb-10">
        <p className="label mb-5 flex items-center gap-3 text-cryo">
          <span className="inline-block h-px w-8 bg-current" />
          Research document
        </p>
        <h1 className="display text-[length:var(--step-4)]">{result.title}</h1>

        <dl className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {meta.map(([k, v]) => (
            <div key={k} className="flex min-w-0 flex-col gap-1.5">
              <dt className="label text-frost-dim">{k}</dt>
              <dd className="truncate font-mono text-xs text-frost" title={v}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <article className="doc max-w-none pb-20">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </article>
    </div>
  );
}