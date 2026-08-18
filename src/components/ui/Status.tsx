const readouts: Record<string, { label: string; className: string; live?: boolean }> = {
  PENDING: { label: "Queued", className: "text-frost-dim" },
  QUEUED: { label: "Queued", className: "text-frost-dim" },
  PROCESSING: { label: "Running", className: "text-flare", live: true },
  COMPLETED: { label: "Ready", className: "text-cryo" },
  FAILED: { label: "Failed", className: "text-[#ff3b6b]" },
  CANCELLED: { label: "Stopped", className: "text-frost-dim line-through" },
};

/** Instrument readout, not a rounded pill. */
export function Status({ status }: { status: string }) {
  const r = readouts[status] ?? { label: status, className: "text-frost-dim" };

  return (
    <span className={`label inline-flex shrink-0 items-center gap-2 ${r.className}`}>
      <span
        aria-hidden
        className={`inline-block h-1.5 w-1.5 bg-current ${r.live ? "signal" : ""}`}
      />
      {r.label}
    </span>
  );
}