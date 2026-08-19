import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth/auth";
import { usageRepository } from "@/repositories/researchRepository";
import { estimateCostUsd } from "@/lib/pricing";

const PROVIDER_LABELS: Record<string, string> = {
  gemini: "Gemini (Technical Deep Dive)",
  nemotron: "Nemotron (Broad Factual)",
  groq: "Groq (Current Developments)",
};

function formatUsd(value: number) {
  if (value === 0) return "$0.00";
  if (value < 0.01) return "< $0.01";
  return `$${value.toFixed(2)}`;
}

export default async function UsagePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { jobsThisMonthCount, totalJobsCount, logs } = await usageRepository.summaryForUser(session.user.id);

  const byProvider = new Map<
    string,
    { calls: number; failures: number; promptTokens: number; completionTokens: number }
  >();

  for (const log of logs) {
    const entry = byProvider.get(log.provider) ?? {
      calls: 0,
      failures: 0,
      promptTokens: 0,
      completionTokens: 0,
    };
    entry.calls += 1;
    if (!log.success) entry.failures += 1;
    entry.promptTokens += log.promptTokens ?? 0;
    entry.completionTokens += log.completionTokens ?? 0;
    byProvider.set(log.provider, entry);
  }

  const rows = [...byProvider.entries()].map(([provider, stats]) => ({
    provider,
    label: PROVIDER_LABELS[provider] ?? provider,
    ...stats,
    costUsd: estimateCostUsd(provider, stats.promptTokens, stats.completionTokens),
  }));

  const totalCostUsd = rows.reduce((sum, r) => sum + r.costUsd, 0);
  const hasAnyTokenData = rows.some((r) => r.promptTokens > 0 || r.completionTokens > 0);

  return (
    <div className="flex flex-col gap-14">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label mb-4 flex items-center gap-3 text-cryo">
            <span className="inline-block h-px w-8 bg-current" />
            Instrumentation
          </p>
          <h1 className="display text-[length:var(--step-4)]">Usage</h1>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-px border border-[color:var(--line-strong)] bg-[color:var(--line-strong)] sm:grid-cols-4">
        {[
          { label: "Jobs this month", value: jobsThisMonthCount },
          { label: "Jobs all-time", value: totalJobsCount },
          { label: "Provider calls", value: logs.length },
          { label: "Estimated cost", value: formatUsd(totalCostUsd) },
        ].map((stat) => (
          <div key={stat.label} className="bg-[color:var(--void)] px-5 py-6 sm:px-6">
            <p className="label text-frost-dim">{stat.label}</p>
            <p className="display mt-2 text-[length:var(--step-2)] tabular-nums">{stat.value}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="label mb-6 text-frost-dim">Per-provider breakdown</h2>

        {rows.length === 0 ? (
          <div className="hatch border border-[color:var(--line-strong)] px-6 py-14 text-center">
            <p className="display text-[length:var(--step-2)] text-frost-dim">No provider activity yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <thead>
                <tr className="label border-b border-[color:var(--line-strong)] text-frost-dim">
                  <th className="py-3 pr-4 font-normal">Provider</th>
                  <th className="py-3 pr-4 font-normal">Calls</th>
                  <th className="py-3 pr-4 font-normal">Failures</th>
                  <th className="py-3 pr-4 font-normal">Prompt tokens</th>
                  <th className="py-3 pr-4 font-normal">Completion tokens</th>
                  <th className="py-3 pr-0 font-normal">Est. cost</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.provider} className="border-b border-[color:var(--line)]">
                    <td className="py-4 pr-4 text-frost">{row.label}</td>
                    <td className="py-4 pr-4 tabular-nums text-frost-muted">{row.calls}</td>
                    <td className="py-4 pr-4 tabular-nums text-frost-muted">{row.failures}</td>
                    <td className="py-4 pr-4 tabular-nums text-frost-muted">{row.promptTokens.toLocaleString()}</td>
                    <td className="py-4 pr-4 tabular-nums text-frost-muted">
                      {row.completionTokens.toLocaleString()}
                    </td>
                    <td className="py-4 pr-0 tabular-nums text-frost-muted">{formatUsd(row.costUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="label mt-6 max-w-[60ch] text-frost-dim">
          Cost is a rough estimate from provider-reported token counts and public list pricing - not exact billing.
          {!hasAnyTokenData &&
            " No token counts have been reported yet for your jobs; run a few more to populate this."}
        </p>
      </section>
    </div>
  );
}