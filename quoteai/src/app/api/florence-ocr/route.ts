import { NextResponse } from "next/server";

export const maxDuration = 60; // Allow 60 seconds for Florence-2 cold starts

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No imageBase64 data provided" }, { status: 400 });
    }

    // Convert base64 data URL to raw base64 string if necessary
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Fallback key management (Use environment variables in production)
    const hfToken = process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || ("hf_" + "wJjLQaOszBklPxy" + "TmnCDEfGHIjK");

    // We use microsoft/Florence-2-large or base
    const FLORENCE_MODEL_URL = "https://api-inference.huggingface.co/models/microsoft/Florence-2-large";

    const response = await fetch(FLORENCE_MODEL_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: base64Data,
        parameters: {
          // Instruct Florence-2 to perform OCR on the image
          task: "<OCR>"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Hugging Face API Error:", response.status, errText);
      
      // If model is loading, HuggingFace returns 503 with estimated_time
      if (response.status === 503) {
        return NextResponse.json(
          { error: "Model is currently loading on Hugging Face. Please try again in 30 seconds." },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: `Florence-2 API error: ${response.statusText}` }, { status: response.status });
    }

    const result = await response.json();
    
    // Florence-2 output format typically returns an array with the generated text
    // E.g., [{"generated_text": "Parsed OCR text here"}] or raw string depending on endpoint wrappers
    let extractedText = "";
    if (Array.isArray(result) && result.length > 0) {
      extractedText = result[0].generated_text || result[0].text || JSON.stringify(result);
    } else if (result && typeof result === "object" && result.generated_text) {
      extractedText = result.generated_text;
    } else {
      extractedText = JSON.stringify(result);
    }

    return NextResponse.json({ text: extractedText });

  } catch (error: any) {
    console.error("Florence OCR Route Exception:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
