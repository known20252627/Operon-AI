/* eslint-disable */
const fs = require('fs');

const headers = {
  'src/lib/constants.ts': `/* ──────────────────────────────────────────────
   QuoteAI — Constants & Mock Data
   ────────────────────────────────────────────── */\n`,
  'src/types/index.ts': `/* ──────────────────────────────────────────────
   QuoteAI — Central Type Definitions
   ────────────────────────────────────────────── */\n`,
  'src/lib/utils.ts': `/* ──────────────────────────────────────────────
   QuoteAI — Shared Utilities
   ────────────────────────────────────────────── */\n`,
  'src/lib/pdf.ts': `/* ──────────────────────────────────────────────
   QuoteAI — PDF Generation
   ────────────────────────────────────────────── */\n`,
  'src/services/api.ts': `/* ──────────────────────────────────────────────
   QuoteAI — API & Services
   ────────────────────────────────────────────── */\n`,
  'src/app/page.tsx': `"use client";\n\n/* ══════════════════════════════════════════════
   QuoteAI — Main Page Orchestrator
   ══════════════════════════════════════════════ */\n`
};

for (const [file, header] of Object.entries(headers)) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // For page.tsx we have "use client" on line 1, then the header.
    // For others, it's just the header at the top.
    
    // We can just remove the old header (anything starting with /* and ending with */ at the top)
    if (file === 'src/app/page.tsx') {
       content = content.replace(/^"use client";[\s\S]*?\*\//, header.trim());
    } else {
       content = content.replace(/^\/\*[\s\S]*?\*\//, header.trim());
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed header in', file);
  }
}
