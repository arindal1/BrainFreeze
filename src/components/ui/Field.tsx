"use client";

import { InputHTMLAttributes, forwardRef, useId } from "react";

const inputClass =
  "w-full border-b border-[color:var(--line-strong)] bg-transparent px-0 py-3.5 text-frost placeholder:text-frost-dim outline-none transition-colors duration-300 focus:border-[color:var(--flare)] focus-visible:outline-none";

/** Bare underline input - no boxes, no rounded chrome. */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${inputClass} ${className}`} {...props} />;
  },
);

/** Labelled field: mono instrument label sitting above a hairline input. */
export const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string; index?: string }
>(function Field({ label, index, className = "", id, ...props }, ref) {
  const auto = useId();
  const fieldId = id ?? auto;

  return (
    <div className="group flex flex-col gap-1">
      <label htmlFor={fieldId} className="label flex items-center gap-2 text-frost-dim">
        {index && <span className="text-flare">{index}</span>}
        {label}
      </label>
      <Input ref={ref} id={fieldId} className={className} {...props} />
    </div>
  );
});