"use client";
/* ──────────────────────────────────────────────
   useToast — ephemeral notifications
   ────────────────────────────────────────────── */

import { useState, useCallback, useRef } from "react";

export function useToast(duration = 2600) {
  const [toast, setToast] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback(
    (message: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast(message);
      timerRef.current = setTimeout(() => setToast(""), duration);
    },
    [duration]
  );

  const clearToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast("");
  }, []);

  return { toast, notify, clearToast };
}
