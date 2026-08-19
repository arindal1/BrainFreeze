"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { randomSurpriseTopic } from "@/lib/surpriseTopics";

const MAX = 500;

export function Console({ onSubmit }: { onSubmit: (query: string) => Promise<unknown> }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastSurprise, setLastSurprise] = useState<string | undefined>(undefined);

  const tooShort = query.trim().length < 2;

  async function dispatch(topic: string) {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await onSubmit(topic);
      setNotice("Queued. Close the tab if you want - the run continues without you.");
      setQuery("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't queue that.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await dispatch(query);
  }

  async function handleSurprise() {
    const topic = randomSurpriseTopic(lastSurprise);
    setLastSurprise(topic);
    await dispatch(topic);
  }

  return (
    <form onSubmit={handleSubmit} className="border-y border-[color:var(--line-strong)] py-8">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor="query" className="label flex items-center gap-2 text-frost-dim">
          <span className="text-flare">01</span> The question
        </label>
        <span className="label text-frost-dim tabular-nums">
          {query.length}/{MAX}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end">
        <input
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          minLength={2}
          maxLength={MAX}
          autoComplete="off"
          placeholder="write something you want researched..."
          className="display w-full flex-1 border-b border-[color:var(--line-strong)] bg-transparent pb-3 text-[length:var(--step-2)] text-frost placeholder:text-frost-dim/60 outline-none transition-colors duration-300 focus:border-[color:var(--flare)]"
        />
        <Button type="submit" disabled={loading || tooShort} className="shrink-0">
          {loading ? "Queuing…" : "Dispatch"}
        </Button>
        <Button
          type="button"
          variant="line"
          onClick={handleSurprise}
          disabled={loading}
          className="shrink-0"
        >
          Surprise me
        </Button>
      </div>

      {/* Dispatch trace - indeterminate, because the queue depth is unknown */}
      <div className="mt-6 h-px overflow-hidden bg-[color:var(--line)]">
        {loading && <div className="sweep h-full w-1/3 bg-flare" />}
      </div>

      <AnimatePresence mode="wait">
        {(error || notice) && (
          <motion.p
            key={error ?? notice}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="status"
            className={`label mt-4 ${error ? "text-[#ff3b6b]" : "text-cryo"}`}
          >
            {error ?? notice}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}