# 🏢 Operon AI — Autonomous Institutional Quotation & Commercial Intelligence Suite

[![Live Production](https://img.shields.io/badge/Live_Vercel_Release-operon--ai--suite.vercel.app-7052D7?style=for-the-badge&logo=vercel)](https://operon-ai-suite.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_16-App_Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React_19-Server_&_Client-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![AI Engine](https://img.shields.io/badge/Groq_Neural_AI-Llama_3.3_70B-10B981?style=for-the-badge&logo=openai&logoColor=white)](https://groq.com/)

---

## 🌟 Executive Summary

**Operon AI** is an advanced autonomous business operating system engineered specifically for healthcare institutions, medical distributors, commercial medical enterprises, and B2B hospital suppliers. 

Built to eliminate manual data entry, clerical friction, and quotation delays, Operon AI deploys a **Two-Stage Neural OCR & AI Processing Engine** to instantly scan complex hospital tender schedules, clinical requisition sheets, and inventory documents. It intelligently filters out background document noise to extract verified line items, executes strict tabular mathematical verification, and publishes executive-ready proforma proposals in real time.

---

## 🚀 Live Enterprise Deployment

Experience the live enterprise suite instantly with zero initial setup:

👉 **[https://operon-ai-suite.vercel.app](https://operon-ai-suite.vercel.app)** 

---

## ✨ Key Enterprise Capabilities

### 1. 🧠 Two-Stage Neural OCR & Document Hub
- **Stage 1 (Optical Recognition):** High-speed document digestion powered by modern OCR scanning engines to capture tabular text, prescription schedules, and requisition matrices from PDF uploads and clinical images.
- **Stage 2 (Cloud Neural AI Elimination):** Leverages **Groq Neural AI (Llama-3.3-70B-Versatile)** to analyze raw OCR output, eliminate extraneous formatting noise, verify accurate medical terminology, and structure items into precise Product Name, Quantity, Rate, and GST data structures.
- **Auto-Learning Catalog:** Automatically identifies unfamiliar clinical inventory SKUs during document scanning and adds them to your persistent local product catalog for instant autocomplete on future bids.

### 2. 💼 Enterprise Quotation Studio & Proforma Engine
- **Live Tabular Verification:** Features full in-browser interactive editing of Product Descriptions, Units of Measure, Quantities, Unit Rates, and custom GST (% or Flat Rate) slabs with instantaneous cryptographic math re-calculation.
- **Dynamic Approval Workflow:** Interactive **`✓ Approve`** controls embedded across every quotation row allow executive managers to confirm contracts with a single click, immediately registering verified deals into your organizational analytics ledger.
- **Precision Export Architecture:**
  - **ExcelJS Enterprise Exports:** Generates fully formatted `.xlsx` workbooks featuring branded headers, dynamic formula scaling (`SUM`, line-item amounts), custom cell border formatting, and clear Terms & Conditions multi-row structural layout.
  - **Executive PDF Rendering:** High-resolution proforma PDF document generation powered by `jsPDF`, featuring company logos, authorized signatory stamps, bank IFSC payment details, and formal invoice formatting.

### 3. 📊 Recognized Revenue & Commercial Analytics
- **Live Financial Synchronization:** Dissolves static dashboard guesses by computing KPIs directly from real-time customer decision tracking:
  - **Total Recognized Approved Revenue** (Valuation computed exclusively from verified approved deals).
  - **Contract Win Rate (%) & Deal Velocity**.
  - **Institutional Account Leaders Table** ranking hospitals by cumulative recognized billing value.
- **🏆 Recently Approved Contracts Feed:** An executive audit trail that immediately captures and displays verified quotation approvals with timestamps, reference IDs, and financial totals.

### 4. 📑 Enterprise Template Studio & Design Center
- **Canva-Inspired Customization:** Build and save custom quotation design layouts in real time using visual color palette tokens, typography scale selectors, layout spacing presets, and custom header/footer architectural branding.
- **Theme Persistence:** Seamlessly switch between dark obsidian executive themes and high-contrast clinical white presentation palettes across all workspace modals.

### 5. 📣 AI Corporate Marketing Officer
- **Executive B2B Communication:** Replaces informal chat prompts with authoritative corporate messaging frameworks tailored for clinical equipment distribution:
  - **Institutional Email Proformas:** Formal subject lines, value propositions, technical specifications, and corporate signature blocks.
  - **WhatsApp Enterprise Advisories:** Cleanly formatted updates for urgent clinical supply announcements.
  - **LinkedIn & Instagram Announcements:** Professional B2B thought-leadership broadcasts with curated medical distribution hashtags.

---

## 🛠️ Technology Architecture

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16** | App Router, Server Actions, API Routes, and Static Edge Optimization |
| **Core UI** | **React 19** | Modern functional components, custom hooks, and concurrent execution |
| **Styling & Theme** | **Vanilla CSS Architecture** | Zero-bloat custom design tokens, HSL palettes, and glassmorphism |
| **AI Inference Engine** | **Groq API & OpenAI SDK** | Cloud inference via Ultra-low latency Llama-3.3-70B models |
| **Document Processing** | **ExcelJS & jsPDF** | Deep style cloning, multi-sheet workbook generation, and vector PDF rendering |
| **State & Storage** | **Browser Edge Persistence** | Event-driven custom local reactive storage architecture |
| **Language** | **TypeScript (Strict Mode)** | Enterprise type safety across all data structures and API contracts |

---

## ⚡ Getting Started & Installation

To run Operon AI locally for development, testing, or customized organization deployments:

### 1. Clone the Repository
```bash
git clone https://github.com/known20252627/Operon-AI.git
cd "Operon-AI/quoteai"
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root directory and add your Groq Neural API key (or rely on the automated production fallback already embedded within the serverless route architecture):
```env
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
```

### 4. Launch the Enterprise Workspace
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to experience the complete suite!

---

## 📂 Codebase Structure & Sitemap

```
quoteai/
├── src/
│   ├── app/                  # Next.js App Router root & backend API Endpoints
│   │   ├── api/              # Serverless AI route handlers (Marketing & Template OCR)
│   │   ├── templates/        # Dedicated Template Studio route
│   │   ├── globals.css       # Core Enterprise Design Token system & scroll geometry
│   │   └── page.tsx          # Master dashboard orchestrator & workspace router
│   ├── components/
│   │   ├── analytics/        # Real-time revenue intelligence & approved contract ledgers
│   │   ├── dashboard/        # Executive landing KPIs, Hero Banner, & AI Telemetry
│   │   ├── marketing/        # Corporate B2B automated communications studio
│   │   ├── ocr/              # 2-Stage Neural document extraction & analysis hub
│   │   ├── quotation/        # Quotation tables, filtering schedules, & export designers
│   │   ├── templates/        # Visual Canva-like custom proforma builder studio
│   │   └── workspace/        # Interactive Quotation Builder modal & reactive line items
│   ├── hooks/                # Reactive custom hooks (useQuotation, useTheme, useToast)
│   ├── lib/                  # Engine utilities, constants, ExcelJS & jsPDF builders
│   ├── services/             # Client-side storage layer, brand syncing, & OCR integration
│   └── types/                # Strict TypeScript interfaces and enterprise domain models
├── public/                   # Static branding assets, icons, and favicons
├── next.config.ts            # Next.js cloud compilation and build tolerance settings
├── tsconfig.json             # TypeScript compiler rules and module resolution overrides
└── package.json              # Project dependency manifest and scripts
```

---

## 🔒 Security & Compliance
- **Data Governance:** Operon AI utilizes client-side encryption and strict ephemeral cloud parsing for document extraction, ensuring confidential healthcare supplier pricing models and customer lists remain completely secured within your local edge environment.
- **Automated Fallbacks:** Designed with resilient multi-layer fallbacks so that continuous integration cloud deployments (such as Vercel Edge Serverless) function reliably without single points of failure in API configuration.

---

## 📜 License & Copyright
**© 2026 Operon AI Corporate Technologies.** Developed for healthcare automation and institutional procurement workflows. All rights reserved.
