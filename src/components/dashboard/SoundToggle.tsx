"use client";

import { useEffect, useState } from "react";
import { isSoundEnabled, setSoundEnabled } from "@/lib/soundPreference";

/** Toggles the alert chime that accompanies in-app toasts - independent of OS notification permission. */
export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only read (SSR always renders the default to avoid a hydration mismatch)
    setEnabled(isSoundEnabled());
  }, []);

  return (
    <button
      onClick={() => {
        const next = !enabled;
        setSoundEnabled(next);
        setEnabled(next);
      }}
      className="label draw inline-block text-frost-muted hover:text-flare"
      title={enabled ? "Mute the alert chime" : "Unmute the alert chime"}
    >
      {enabled ? "Sound" : "Muted"}
    </button>
  );
}