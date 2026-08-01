import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "PASTE_YOUR_GROQ_API_KEY_HERE") {
      return NextResponse.json({ error: "Groq API key not configured." }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const { gridData } = await req.json();

    if (!gridData) {
      return NextResponse.json({ error: "Missing grid data" }, { status: 400 });
    }

    const prompt = `You are an expert at analyzing Excel quotation/invoice templates used by Indian businesses.

I will give you a grid of an Excel file. Each row is labeled R1, R2, etc. Columns are 1-indexed (A=1, B=2, C=3, D=4...).

Your job: identify the EXACT cell coordinates for data injection.

IMPORTANT CONCEPTS:
- Templates have PLACEHOLDER TEXT in cells (like "Client Name", "Street address", "Your Company name", "MM/DD/YYYY", "00001", "00002"). These placeholders should be OVERWRITTEN with real data.
- When I ask for "nameRow" and "nameCol", I want the row and column of the CELL CONTAINING the placeholder text itself (e.g. the cell that says "Client Name"), NOT a cell next to a label.

TASK:
1. PRODUCT TABLE: Find the header row with columns like "Description", "Qty", "Rate", "Amount", "Unit cost", etc.
2. CLIENT/BILLING DETAILS: Look for a section labeled "Billed to", "Bill to", "To", "M/s", "Customer", "Ship to", "Buyer", or similar. Below that label, there will be placeholder cells like "Client Name", "Street address", "City", "Phone", etc. Return the coordinates of THOSE placeholder cells:
   - nameRow/nameCol = the cell containing "Client Name" or similar placeholder
   - addressRow/addressCol = the cell containing "Street address" or "Address" placeholder  
   - gstRow/gstCol = the cell containing "ZIP Code", "GST", "GSTIN", or a tax ID placeholder
   - phoneRow/phoneCol = the cell containing "Phone" placeholder
3. QUOTATION NUMBER: Find the cell next to a "Quote #", "Quotation No", or "Invoice No" label that contains a placeholder like "00001". Return that cell's coordinates.
4. DATE: Find the cell next to "Date:" that contains a placeholder like "MM/DD/YYYY". Return that cell's coordinates.
5. COMPANY NAME: Find the cell containing a placeholder like "Your Company name" or the company name. Return its coordinates.

Return ONLY this JSON:
{
  "headerRowIndex": <number>,
  "columns": {
    "srNo": <number or null>,
    "product": <number>,
    "qty": <number>,
    "rate": <number>,
    "gst": <number or null>,
    "amount": <number>
  },
  "clientDetailsCoords": {
    "nameRow": <number>,
    "nameCol": <number>,
    "addressRow": <number>,
    "addressCol": <number>,
    "gstRow": <number>,
    "gstCol": <number>,
    "phoneRow": <number>,
    "phoneCol": <number>
  },
  "quotationNoCoords": {
    "row": <number or null>,
    "col": <number or null>
  },
  "dateCoords": {
    "row": <number or null>,
    "col": <number or null>
  },
  "companyNameCoords": {
    "row": <number or null>,
    "col": <number or null>
  }
}

Excel Grid:
${gridData}

Return ONLY the raw JSON. No markdown, no explanation, no comments.`;

    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const aiOutput = response.choices[0].message.content;
    const parsed = JSON.parse(aiOutput || "{}");

    console.log("🤖 AI Template Analysis Result:", JSON.stringify(parsed, null, 2));

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("AI Template Analysis Error:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
