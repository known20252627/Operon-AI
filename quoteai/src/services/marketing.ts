/**
 * Marketing Message Generator Service
 * Calls /api/generate-marketing-message (Groq / llama-3.3-70b-versatile).
 */

export interface MarketingMessageResult {
  message: string;
  subject?: string; // Only for email channel
}

export async function generateMarketingMessage(
  messageIntent: string,
  channel: "whatsapp" | "email" | "instagram",
  businessDescription?: string,
  tone?: string
): Promise<MarketingMessageResult> {
  if (!messageIntent.trim()) {
    throw new Error("Please describe what message you want before generating.");
  }

  const res = await fetch("/api/generate-marketing-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageIntent, channel, businessDescription, tone }),
  });

  const data = await res.json();

  if (!res.ok) {
    const serverError = data?.error || "An unexpected error occurred. Please try again.";
    if (serverError.toLowerCase().includes("groq api key")) {
      throw new Error(
        "AI Marketing isn't configured — check GROQ_API_KEY in your .env.local file."
      );
    }
    throw new Error(serverError);
  }

  if (!data.message) {
    throw new Error("The AI returned an empty response. Please try again.");
  }

  return {
    message: data.message as string,
    subject: data.subject as string | undefined,
  };
}
