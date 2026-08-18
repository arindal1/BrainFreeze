export default function Loading() {
  return (
    <div className="flex min-h-[60svh] flex-1 flex-col items-center justify-center gap-6 px-5">
      <p className="label flex items-center gap-3 text-cryo">
        <span aria-hidden className="signal inline-block h-1.5 w-1.5 bg-current" />
        Calibrating instrument
      </p>
      <div className="relative h-px w-48 overflow-hidden bg-[color:var(--line-strong)]">
        <span aria-hidden className="sweep absolute inset-y-0 left-0 w-1/3 bg-flare" />
      </div>
    </div>
  );
}