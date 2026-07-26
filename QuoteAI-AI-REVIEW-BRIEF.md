# QuoteAI — Product & Engineering Review Brief

## Review goal

Please review QuoteAI as an OpenAI Codex India Hackathon 2026 project in the **Domain Agents** track. Give candid, specific feedback on product scope, UX, technical architecture, security, and the fastest path to a convincing production-ready demo.

## Live prototype

https://quoteai-brown.vercel.app

## Product

**QuoteAI** is an AI sales and quotation agent for medical-equipment businesses. It is intended to take unstructured customer requests (photos, handwritten lists, PDFs, emails, WhatsApp text, or tenders), identify products and quantities, match them against inventory, create an editable commercial quotation, produce a branded PDF, and help the sales team follow up.

## What is already implemented in the prototype

1. Premium, responsive SaaS dashboard with revenue, quotation, follow-up, and customer metrics.
2. AI quotation workspace with demo medical products, editable quantities, discount, GST, and live totals.
3. Document-upload UI for images and PDFs, followed by a simulated AI extraction result.
4. Custom quotation design controls: company name, brand accent colour, and terms and conditions.
5. Client-side downloadable PDF quotation generation.
6. Company settings UI.
7. Deployment on Vercel.

## Current technology

- Next.js 16.2.11, React 19, TypeScript
- Tailwind CSS 4 plus hand-authored responsive CSS
- jsPDF for in-browser PDF generation
- Vercel hosting

## Current source structure

```text
quoteai/
  src/app/page.tsx       # Complete interactive frontend prototype
  src/app/globals.css    # Design system and responsive styles
  src/app/layout.tsx     # Root layout and metadata
  package.json           # Build scripts and dependencies
```

## Important implementation reality

This is currently a frontend prototype with local React state and sample data. Uploading a document currently simulates extraction; there is no database, auth, backend, OCR, OpenAI integration, or actual semantic product search yet.

## Intended production architecture

```text
Next.js frontend (Vercel)
  -> FastAPI REST API (Render)
  -> Supabase Auth, PostgreSQL, pgvector, Storage
  -> OpenAI Vision + structured extraction + embeddings
  -> Background jobs for OCR, PDF generation, notifications
```

## Target production capabilities

- Multi-tenant company accounts and secure role-based access.
- Customer CRM and product inventory.
- OCR/vision extraction from image, handwritten note, PDF, tender, email, and plain text.
- Semantic matching of colloquial or misspelled product requests to the inventory.
- Human review when extraction or matching confidence is low.
- Immutable quotation versions and audit logs.
- Custom quotation template, PDF, Excel export/import, communication drafts, and follow-up reminders.
- Tender analysis, analytics, notifications, dark mode, and global search.

## Questions for your review

1. Does the product have a sharply differentiated and credible hackathon story? What should be cut or emphasized?
2. What are the top five UX improvements that would make the demo feel like an AI employee rather than a generic dashboard?
3. Is the proposed frontend + FastAPI + Supabase architecture appropriate? What would you change?
4. How should OCR, OpenAI structured outputs, embeddings, and deterministic pricing validation be designed safely for medical-equipment quotations?
5. What database entities and API boundaries are missing for multi-tenant production use?
6. What security, privacy, compliance, and reliability risks should be addressed before handling customer/tender documents?
7. What should be implemented next to maximize hackathon judging impact in 1–2 days?
8. Review the visual product via the live link: which parts look polished, and which parts need refinement?

## Suggested response format

Please give:

1. A scored review: product, UX, architecture, security, demo readiness.
2. A prioritized list of changes: critical, high value, nice to have.
3. A two-day build plan.
4. Any concrete code or API examples that would materially improve the next iteration.

## Source code

The companion archive `QuoteAI-ChatGPT-source.zip` contains the complete project source excluding `node_modules` and build output. Upload it together with this brief if the reviewer supports ZIP uploads.
