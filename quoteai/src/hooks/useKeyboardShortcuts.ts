"use client";
/* ──────────────────────────────────────────────
   useKeyboardShortcuts — global hotkey registry
   ────────────────────────────────────────────── */

import { useEffect } from "react";

export type ShortcutMap = Record<string, () => void>;

/**
 * Register global keyboard shortcuts.
 * Keys use the format: "mod+k" where mod = Ctrl (Win) or Cmd (Mac).
 * Multiple keys: "mod+shift+p"
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const parts: string[] = [];
      if (e.metaKey || e.ctrlKey) parts.push("mod");
      if (e.shiftKey) parts.push("shift");
      if (e.altKey) parts.push("alt");
      parts.push(e.key.toLowerCase());

      const combo = parts.join("+");
      const handler = shortcuts[combo];

      if (handler) {
        e.preventDefault();
        e.stopPropagation();
        handler();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
