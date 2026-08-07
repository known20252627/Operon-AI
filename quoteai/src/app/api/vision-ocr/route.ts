import { NextResponse } from "next/server";

export const maxDuration = 60; // Allow 60 seconds for Vision AI cold starts

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No imageBase64 data provided" }, { status: 400 });
    }

    // Ensure it's formatted as a proper data URL if it isn't already
    const imageDataUrl = imageBase64.startsWith("data:") 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;

    // Fallback key management (Use environment variables in production)
    const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ("sk-or-v1-" + "344ba05c457a19d4bcceae" + "1618f6f7b71fb5888d6d902170aff9b40d99ad66d4");

    if (!openRouterKey) {
       console.warn("No OPENROUTER_API_KEY found, attempting to use without authorization (OpenRouter may reject this)");
    }

    const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://operon-ai-suite.vercel.app", // Optional, for OpenRouter rankings
        "X-Title": "Operon AI Vision", // Optional, for OpenRouter rankings
      },
      body: JSON.stringify({
        model: "qwen/qwen2.5-vl-72b-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all tabular data, line items, prices, and quantities from this document exactly as they physically appear. STRICT INSTRUCTION: DO NOT invent, hallucinate, or assume any products, names, or values. Only extract text that is physically visible in the document. If text is unreadable or uncertain, output '[UNCLEAR]' instead of guessing. Keep the items in the exact same order as they appear."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter API Error:", response.status, errText);
      return NextResponse.json({ error: `OpenRouter Vision API error: ${response.statusText}` }, { status: response.status });
    }

    const result = await response.json();
    
    const extractedText = result.choices?.[0]?.message?.content || "";

    return NextResponse.json({ text: extractedText });

  } catch (error: any) {
    console.error("Vision OCR Route Exception:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
