import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "PASTE_YOUR_GROQ_API_KEY_HERE") {
      return NextResponse.json(
        { error: "Groq API key not configured. Please add GROQ_API_KEY to your .env.local file." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const body = await req.json();
    const {
      businessDescription,
      messageIntent,
      channel,
      tone,
    } = body as {
      businessDescription?: string;
      messageIntent: string;
      channel: "whatsapp" | "email" | "instagram";
      tone?: string;
    };

    if (!messageIntent || !channel) {
      return NextResponse.json(
        { error: "Missing required fields: messageIntent and channel." },
        { status: 400 }
      );
    }

    const toneInstruction = tone
      ? `Use a ${tone} tone — but always remain professional and business-appropriate.`
      : "Use a strictly professional, polished, and corporate tone throughout.";

    const businessContext = businessDescription?.trim()
      ? `\n\nBusiness Context:\n${businessDescription}`
      : "";

    let prompt: string;

    if (channel === "whatsapp") {
      prompt = `You are a senior B2B marketing copywriter. Write a professional WhatsApp broadcast message for a business audience.

Rules:
- Keep it under 500 characters total.
- Use at most 1–2 subtle, relevant emojis. Do NOT spam emojis.
- Maintain a polished, professional, corporate tone — this is a B2B message, not casual chat.
- Do NOT use slang, exclamation marks excessively, or overly salesy language.
- Do NOT include a subject line.
- End with a clear, professional call-to-action (e.g. "Reach out for a quote" or "Contact us to learn more").
- ${toneInstruction}${businessContext}

What the message should be about:
${messageIntent}

Return ONLY the WhatsApp message text. No explanation, no quotes around it, no markdown.`;

    } else if (channel === "email") {
      prompt = `You are a senior B2B marketing copywriter. Write a professional marketing email for a business audience.

Rules:
- First line must be the subject line, prefixed with exactly "Subject: "
- Then one blank line.
- Then the email body: 3–5 short, professional paragraphs, under 300 words total.
- Maintain a formal, polished, corporate tone throughout — no casual language.
- Do NOT use excessive bullet points, exclamation marks, or emojis — write clean, flowing paragraphs.
- ${toneInstruction}
- End with a professional call-to-action and a courteous sign-off.${businessContext}

What the message should be about:
${messageIntent}

Return ONLY: the subject line (prefixed "Subject: "), a blank line, then the email body. No extra explanation.`;

    } else {
      // Instagram
      prompt = `You are a senior B2B social media copywriter. Write a professional Instagram caption for a business page.

Rules:
- Keep the main caption under 300 characters (before hashtags).
- Use 1–2 relevant emojis — keep it clean and professional, not casual.
- Maintain a confident, authoritative, corporate tone suitable for a business Instagram page.
- Add a line break then 5–8 relevant industry hashtags on a new line.
- ${toneInstruction}${businessContext}

What the post should be about:
${messageIntent}

Return ONLY the Instagram caption with hashtags. No extra explanation.`;
    }

    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const rawText = response.choices[0].message.content || "";

    if (channel === "email") {
      const lines = rawText.split("\n");
      const subjectLine = lines[0]?.replace(/^subject:\s*/i, "").trim() || "";
      const bodyLines = lines.slice(1);
      // Skip leading blank line after subject
      const firstNonBlank = bodyLines.findIndex((l) => l.trim().length > 0);
      const body = bodyLines.slice(firstNonBlank).join("\n").trim();
      return NextResponse.json({ message: body, subject: subjectLine });
    }

    return NextResponse.json({ message: rawText.trim() });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Marketing Message Generation Error:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
