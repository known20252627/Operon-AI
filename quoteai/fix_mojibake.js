/* eslint-disable */
const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const files = walkSync('./src');
let changedCount = 0;

files.forEach(file => {
  if (!file.match(/\.(tsx|ts|css)$/)) return;
  // Read as utf-8, but replace corrupted sequences.
  // The prompt says: "â€", "Ã¢", "â”€", "ðŸ"
  
  // Actually, we can do this universally: 
  // Read file as binary string (latin1)
  let content = fs.readFileSync(file, 'latin1');
  let original = content;

  // Let's try converting latin1 string back to utf8.
  // This reverses "UTF-8 interpreted as latin1 and saved as UTF-8"
  // Wait, if it was saved as UTF-8, then reading it as latin1 gives the raw bytes.
  try {
     let decoded = Buffer.from(content, 'latin1').toString('utf8');
     // If it decodes cleanly and actually changes
     if (decoded !== content && !decoded.includes('Ã')) {
         // Some files might be valid utf8 already, decoding them as if they were mojibake will mess them up.
         // Let's verify by checking if decoded has invalid replacements 
         if (!decoded.includes('')) {
             // We can check if decoded contains common good chars
             // Actually, a safer approach is to do targeted replacements on utf-8 read
         }
     }
  } catch(e) {}
  
  // Safe string replacement approach on utf-8 content:
  let utf8Content = fs.readFileSync(file, 'utf8');
  let originalUtf8 = utf8Content;
  
  const replacements = {
      'â”€': '─',
      'â•': '═',
      'âœ“': '✓',
      'ðŸ“„': '📄',
      'âœ•': '✕',
      'âœ¨': '✨',
      'â†’': '→',
      'âš™': '⚙',
      'âš¡': '⚡',
      'âœŽ': '✏️',
      'â—': '●',
      'â—¯': '○',
      'â‹®': '⋮',
      'âŒ•': '⌕',
      'âŒƒ': '⌄',
      'âš ': '⚠',
      'âœ‰': '✉',
      'ðŸ’¬': '💬',
      'â—·': '◷',
      'â—¦': '◦',
      'â—¾': '▣',
      'âœ¦': '✦',
      'â“': '⏳',
      'â†»': '↻',
      'â—': '●',
      'â€œ': '“',
      'â€': '”',
      'â€™': '’',
      'â€”': '—',
      'â€“': '–',
      'â—…': '◈',
      'Ã¢â‚¬â€œ': '—', // long dash
      'Ã¢â‚¬â€': '─',
      'â•': '═',
      'â•â•': '══',
      'â”€â”€': '──',
  };

  for (let bad in replacements) {
      utf8Content = utf8Content.split(bad).join(replacements[bad]);
  }
  
  // Extra replacements for the broken headers
  utf8Content = utf8Content.replace(/\?"\?\?"\?\?"\?\?"\?\?"\?\?"\?/g, '──────────────────────────');
  utf8Content = utf8Content.replace(/\?"\?\?"\?/g, '──────');
  utf8Content = utf8Content.replace(/\?"\?/g, '─');
  utf8Content = utf8Content.replace(/\?"/g, '—');
  utf8Content = utf8Content.replace(/â”€/g, '─');
  
  // Another fallback for the constants file specifically:
  if (file.includes('constants.ts')) {
     utf8Content = utf8Content.replace(/\/\* [^\n]*\n[^\n]*\n[^\n]* \*\//g, `/* ──────────────────────────────────────────────
   QuoteAI — Constants & Mock Data
   ────────────────────────────────────────────── */`);
  }
  if (file.includes('globals.css')) {
     utf8Content = utf8Content.replace(/\/\* [^\n]*\n[^\n]*\n[^\n]* \*\//g, `/* ──────────────────────────────────────────────
   QuoteAI — Global Styles & Design System
   ────────────────────────────────────────────── */`);
  }
  if (file.includes('page.tsx')) {
     utf8Content = utf8Content.replace(/\/\* [^\n]*\n[^\n]*\n[^\n]* \*\//g, `/* ══════════════════════════════════════════════
   QuoteAI — Main Page Orchestrator
   ══════════════════════════════════════════════ */`);
  }
  if (file.includes('api.ts')) {
     utf8Content = utf8Content.replace(/\/\* [^\n]*\n[^\n]*\n[^\n]* \*\//g, `/* ──────────────────────────────────────────────
   QuoteAI — API & Services
   ────────────────────────────────────────────── */`);
  }
  if (file.includes('pdf.ts')) {
     utf8Content = utf8Content.replace(/\/\* [^\n]*\n[^\n]*\n[^\n]* \*\//g, `/* ──────────────────────────────────────────────
   QuoteAI — PDF Generation
   ────────────────────────────────────────────── */`);
  }
  if (file.includes('utils.ts')) {
     utf8Content = utf8Content.replace(/\/\* [^\n]*\n[^\n]*\n[^\n]* \*\//g, `/* ──────────────────────────────────────────────
   QuoteAI — Shared Utilities
   ────────────────────────────────────────────── */`);
  }
  if (file.includes('index.ts') && file.includes('types')) {
     utf8Content = utf8Content.replace(/\/\* [^\n]*\n[^\n]*\n[^\n]* \*\//g, `/* ──────────────────────────────────────────────
   QuoteAI — Central Type Definitions
   ────────────────────────────────────────────── */`);
  }

  if (utf8Content !== originalUtf8) {
    fs.writeFileSync(file, utf8Content, 'utf8');
    changedCount++;
    console.log('Fixed', file);
  }
});
console.log('Total files fixed:', changedCount);
