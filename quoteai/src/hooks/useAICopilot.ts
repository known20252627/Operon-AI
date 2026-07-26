"use client";
/* ──────────────────────────────────────────────
   useAICopilot — chat messages & command handling
   ────────────────────────────────────────────── */

import { useState, useCallback } from "react";
import { generateId } from "@/lib/utils";
import type { CopilotMessage } from "@/types";

const INITIAL_MESSAGES: CopilotMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hello! I'm your AI Sales Copilot. I can help you adjust quotations, draft messages, analyze tenders, and more. Try a command like `/price` or just ask me anything.",
    timestamp: new Date().toISOString(),
  },
];

/** Simulate AI responses for demo purposes. */
function generateResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.startsWith("/price") || lower.includes("reduce price")) {
    return "Done — I've reduced all line item prices by 5%. The new total is ₹42,813 (previously ₹45,066). This brings the margin down from 22% to 17.8%. Would you like to adjust further?";
  }
  if (lower.startsWith("/replace") || lower.includes("replace")) {
    return "I found 1 imported product in this quotation. I can replace the **Pulse Oximeter Pro** (BPL Medical, ₹1,240) with **Pulse Oximeter Lite** (Dr. Trust, ₹980) — a local alternative with 92% specification match. Shall I make the swap?";
  }
  if (lower.startsWith("/govt") || lower.includes("government")) {
    return "Government quotation format applied. Changes:\n• Added GeM reference fields\n• Included EMD clause\n• Added warranty compliance section\n• Format set to landscape A4\n\nReady for download.";
  }
  if (lower.startsWith("/freight") || lower.includes("freight") || lower.includes("shipping")) {
    return "Freight estimate based on delivery to CityCare Hospital, Mumbai:\n• Standard (7 days): ₹850\n• Express (3 days): ₹1,400\n• Same-day: ₹2,200\n\nWhich option should I add?";
  }
  if (lower.startsWith("/email") || lower.includes("email")) {
    return '**Draft email generated:**\n\nSubject: Quotation QT-2026-0129 — Medline Systems\n\nDear Priya,\n\nPlease find attached our quotation for the requested medical equipment. The total comes to ₹45,066 inclusive of GST, with a 5% hospital discount applied.\n\nKey highlights:\n• All items in stock — ready for dispatch\n• Delivery within 7 working days\n• Prices valid for 15 days\n\nPlease let me know if you need any adjustments.\n\nBest regards,\nPratik Shah\nMedline Systems';
  }
  if (lower.startsWith("/whatsapp") || lower.includes("whatsapp")) {
    return "**WhatsApp message draft:**\n\nHi Priya 👋\n\nSharing the quotation for your recent request — QT-2026-0129.\n\n📋 3 items | ₹45,066 incl. GST\n🏷️ 5% hospital discount applied\n📦 All items in stock\n\nI've attached the PDF. Let me know if any changes are needed!\n\n— Pratik, Medline Systems";
  }
  if (lower.startsWith("/explain") || lower.includes("explain")) {
    return "**Quotation Breakdown:**\n\n| Item | Qty | Rate | Amount |\n|---|---|---|---|\n| BP Monitor | 12 | ₹1,850 | ₹22,200 |\n| Pulse Oximeter | 8 | ₹1,240 | ₹9,920 |\n| IR Thermometer | 15 | ₹890 | ₹13,350 |\n\nSubtotal: ₹45,470\nDiscount (5%): -₹2,274\nGST: ₹1,870\n**Total: ₹45,066**\n\nEstimated margin: 19.2% (₹8,653)";
  }
  if (lower.startsWith("/tender") || lower.includes("tender")) {
    return "**Tender Summary:**\n\nI'll need a tender document to analyze. You can:\n1. Upload a PDF/image using the Scan tool\n2. Paste the tender text here\n\nI'll extract products, deadlines, warranty requirements, EMD, and generate a compliant quotation.";
  }

  return `I understand you want to: "${input}". In a production environment, I'd process this with the AI backend. For now, try one of my commands:\n\n• \`/price\` — Adjust pricing\n• \`/email\` — Draft follow-up email\n• \`/whatsapp\` — Draft WhatsApp message\n• \`/explain\` — Explain quotation breakdown\n• \`/freight\` — Add shipping charges`;
}

export function useAICopilot() {
  const [messages, setMessages] = useState<CopilotMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: CopilotMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
      command: content.startsWith("/") ? content.split(" ")[0] : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    const response = generateResponse(content);
    const aiMsg: CopilotMessage = {
      id: generateId(),
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
  }, []);

  return { messages, isTyping, sendMessage, clearMessages };
}
