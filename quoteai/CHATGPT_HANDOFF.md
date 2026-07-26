# QuoteAI — ChatGPT Handoff

## What this is

QuoteAI is a Next.js 16 + TypeScript prototype for an AI quotation agent for medical-equipment businesses. It is deployed at https://quoteai-brown.vercel.app.

## Implemented user flows

- SaaS dashboard with quotation, revenue, customer, and follow-up summaries.
- AI quotation workspace with editable medical-product line items, quantities, discount, GST, and calculated totals.
- Image/PDF request upload interface and simulated AI extraction into a quotation request.
- Custom quotation design settings: company name, accent colour, and terms.
- Browser-generated downloadable PDF quotations using `jspdf`.
- Editable company-settings interface.
- Responsive styling for desktop and mobile.

## Stack

- Next.js 16.2.11, React 19, TypeScript
- Tailwind CSS 4 plus custom CSS
- jsPDF for client-side PDF export
- Vercel production deployment

## Important source files

- `src/app/page.tsx` — the full interactive prototype and UI state.
- `src/app/globals.css` — the application design system and responsive styles.
- `src/app/layout.tsx` — application metadata and root layout.
- `package.json` — scripts and dependencies.

## Commands

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
```

## Current limitation

The document extraction is intentionally client-side simulated. To make it production-ready, add a FastAPI backend that stores files in Supabase Storage and invokes OpenAI vision/document extraction; persist customers, products, quotations, versions, and templates in Supabase PostgreSQL.

## Suggested next request for ChatGPT

"Turn this QuoteAI frontend prototype into a production SaaS. Add Supabase Auth and PostgreSQL, a FastAPI backend, OpenAI Vision document extraction, pgvector product matching, persistent quotation versioning, and secure PDF/storage workflows. Preserve the existing visual design."
