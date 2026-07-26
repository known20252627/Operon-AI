"use client";
/* ──────────────────────────────────────────────
   useAITimeline — animated step-by-step pipeline
   ────────────────────────────────────────────── */

import { useState, useCallback, useRef } from "react";
import { AI_TIMELINE_STEPS } from "@/lib/constants";
import type { AIStep } from "@/types";

export function useAITimeline() {
  const [steps, setSteps] = useState<AIStep[]>(
    AI_TIMELINE_STEPS.map((s) => ({ ...s }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const cancelRef = useRef(false);

  const reset = useCallback(() => {
    cancelRef.current = true;
    setSteps(AI_TIMELINE_STEPS.map((s) => ({ ...s, status: "pending" })));
    setCurrentIndex(-1);
    setIsRunning(false);
  }, []);

  const start = useCallback(async () => {
    cancelRef.current = false;
    setIsRunning(true);
    const fresh = AI_TIMELINE_STEPS.map((s) => ({ ...s, status: "pending" as const }));
    setSteps(fresh);

    for (let i = 0; i < fresh.length; i++) {
      if (cancelRef.current) break;

      setCurrentIndex(i);
      setSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s))
      );

      // Simulate processing time (300–800ms per step)
      const duration = 300 + Math.random() * 500;
      await new Promise((resolve) => setTimeout(resolve, duration));

      if (cancelRef.current) break;

      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "complete", duration: Math.round(duration) } : s
        )
      );
    }

    if (!cancelRef.current) {
      setIsRunning(false);
    }
  }, []);

  const isComplete = steps.every((s) => s.status === "complete");

  return { steps, isRunning, currentIndex, isComplete, start, reset };
}
