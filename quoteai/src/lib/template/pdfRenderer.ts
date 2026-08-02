/* ══════════════════════════════════════════════
   QuoteAI — Deterministic PDF Quotation Renderer
   ══════════════════════════════════════════════ */

import type { QuotationTemplate } from "@/types/template";
import type { ExportQuotationData } from "./excelRenderer";

/**
 * Deterministically generates an identical visual presentation for PDF exportation
 * using an isolated, high-resolution print rendering pipeline.
 */
export async function generateDeterministicPDF(data: ExportQuotationData, template: QuotationTemplate): Promise<void> {
  const cfg = template.config;
  const isDark = cfg.theme === "dark";
  const primary = cfg.primaryColor || "#7052d7";
  const font = cfg.font || "Inter, -apple-system, sans-serif";

  const activeCols = cfg.columns;
  const labels = cfg.columnLabels;

  const colHeaders: string[] = [];
  if (activeCols.srNo) colHeaders.push(labels.srNo);
  if (activeCols.product) colHeaders.push(labels.product);
  if (activeCols.description) colHeaders.push(labels.description);
  if (activeCols.hsn) colHeaders.push(labels.hsn);
  if (activeCols.qty) colHeaders.push(labels.qty);
  if (activeCols.unit) colHeaders.push(labels.unit);
  if (activeCols.rate) colHeaders.push(labels.rate);
  if (activeCols.gst) colHeaders.push(labels.gst);
  if (activeCols.discount) colHeaders.push(labels.discount);
  if (activeCols.amount) colHeaders.push(labels.amount);

  const subtotal = data.items.reduce((acc, i) => acc + (Number(i.qty) || 1) * (Number(i.rate) || 0), 0);
  const estimatedTax = subtotal * 0.12;
  const discountAmount = subtotal * (data.discount / 100);
  const grandTotal = subtotal + estimatedTax - discountAmount;

  const fontScale = cfg.fontSizeScale === "compact" ? "11px" : cfg.fontSizeScale === "spacious" ? "14px" : "13px";
  const activeWidgets = (cfg.widgets || []).filter((w) => w.enabled);
  const getWidgetHtml = (pos: string) => {
    return activeWidgets
      .filter((w) => w.position === pos)
      .map((w) => {
        const isGrad = w.style === "gradient";
        const isWarn = w.style === "warning";
        const bg = isGrad ? "#f3f0ff" : isWarn ? "#fffbeb" : "#f8fafc";
        const border = isGrad ? primary : isWarn ? "#f59e0b" : "#cbd5e1";
        return `<div style="background: ${bg}; border: 1px solid ${border}; border-left: 4px solid ${border}; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #334155;">
          <div style="font-weight: 800; color: ${isWarn ? "#d97706" : primary}; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
            <span>${w.title}</span>
            <span style="font-size: 9px; background: ${primary}; color: white; padding: 1px 6px; border-radius: 8px; text-transform: uppercase;">Widget</span>
          </div>
          <div style="white-space: pre-line; line-height: 1.5;">${w.content}</div>
        </div>`;
      })
      .join("");
  };
  const watermarkWidget = activeWidgets.find((w) => w.position === "watermark");

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Quotation #${data.quotationId} - ${data.customerName}</title>
  <style>
    @page {
      size: ${cfg.paperSize || "A4"} portrait;
      margin: ${cfg.margins?.top || 15}mm ${cfg.margins?.right || 15}mm ${cfg.margins?.bottom || 15}mm ${cfg.margins?.left || 15}mm;
    }
    body {
      font-family: ${font}, sans-serif;
      margin: 0;
      padding: 24px;
      color: ${isDark ? "#f8fafc" : "#1e293b"};
      background-color: ${isDark ? "#0f172a" : "#ffffff"};
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid ${primary};
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: ${primary};
      letter-spacing: -0.02em;
      margin: 0 0 6px 0;
    }
    .brand-subtitle {
      font-size: 13px;
      color: #64748b;
      max-width: 320px;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-title {
      font-size: 22px;
      font-weight: 700;
      color: ${isDark ? "#e2e8f0" : "#0f172a"};
      margin: 0 0 4px 0;
    }
    .doc-date {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
    }
    .customer-box {
      background: ${isDark ? "#1e293b" : "#f8fafc"};
      border-left: 4px solid ${primary};
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 28px;
    }
    .customer-box small {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      font-weight: 700;
      display: block;
      margin-bottom: 4px;
    }
    .customer-name {
      font-size: 17px;
      font-weight: 700;
      color: ${isDark ? "#f8fafc" : "#0f172a"};
      margin: 0;
    }
    .customer-details {
      font-size: 13px;
      color: #64748b;
      margin: 4px 0 0 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    th {
      background: ${primary};
      color: #ffffff !important;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      text-align: left;
      padding: 12px 10px;
      border-bottom: 2px solid #334155;
    }
    th.text-right, td.text-right { text-align: right; }
    th.text-center, td.text-center { text-align: center; }
    td {
      padding: 12px 10px;
      font-size: ${fontScale};
      border-bottom: 1px solid ${isDark ? "#334155" : "#e2e8f0"};
    }
    tr:nth-child(even) td {
      background: ${cfg.tableStyle === "striped" ? (isDark ? "#1e293b" : "#f8fafc") : "transparent"};
    }
    .totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 36px;
    }
    .totals-table {
      width: 280px;
      border-collapse: collapse;
    }
    .totals-table td {
      padding: 8px 0;
      border: none;
      font-size: 14px;
    }
    .totals-table tr.grand-total td {
      font-size: 17px;
      font-weight: 800;
      color: ${primary};
      border-top: 2px solid ${isDark ? "#475569" : "#cbd5e1"};
      border-bottom: 3px double ${isDark ? "#475569" : "#0f172a"};
      padding-top: 12px;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      border-top: 1px solid #e2e8f0;
      padding-top: 24px;
    }
    .footer-section h5 {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      margin: 0 0 8px 0;
      color: #334155;
    }
    .footer-section p {
      font-size: 12px;
      color: #64748b;
      margin: 0;
      white-space: pre-line;
      line-height: 1.6;
    }
    .signature-block {
      margin-top: 40px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      text-align: right;
    }
    .signature-company {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 48px;
      color: ${isDark ? "#e2e8f0" : "#1e293b"};
    }
    .signature-line {
      border-top: 1px solid #94a3b8;
      padding-top: 6px;
      width: 200px;
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  ${watermarkWidget ? `<div style="position: fixed; top: 35%; left: 15%; transform: rotate(-30deg); font-size: 70px; font-weight: 900; color: rgba(0,0,0,0.05); z-index: -1; letter-spacing: 8px;">${watermarkWidget.content || "PROFORMA"}</div>` : ""}
  <div class="header">
    <div>
      ${cfg.company.logo ? `<img src="${cfg.company.logo}" style="max-height: 48px; margin-bottom: 10px; display: block;" alt="Logo"/>` : ""}
      <h1 class="brand-title">${cfg.company.name || "OPERON AI ENTERPRISE"}</h1>
      <div class="brand-subtitle">
        ${cfg.company.address || "Corporate Headquarters, India"}<br />
        Email: ${cfg.company.email || "sales@operonai.com"} ${cfg.company.gstNumber ? `· GSTIN: <strong>${cfg.company.gstNumber}</strong>` : ""}
      </div>
    </div>
    <div class="doc-meta">
      <h2 class="doc-title">QUOTATION</h2>
      <div class="doc-date">#${data.quotationId} &nbsp;·&nbsp; ${data.date || new Date().toLocaleDateString("en-IN")}</div>
    </div>
  </div>

  <div class="customer-box">
    <small>BILL TO / PREPARED FOR:</small>
    <h3 class="customer-name">${data.customerName || "Valued Customer"}</h3>
    ${data.clientDetails ? `<p class="customer-details">${[data.clientDetails.address, data.clientDetails.gstNumber ? `GSTIN: ${data.clientDetails.gstNumber}` : undefined, data.clientDetails.phone].filter(Boolean).join(" · ")}</p>` : ""}
  </div>

  ${getWidgetHtml("above_table")}

  <table>
    <thead>
      <tr>
        ${activeCols.srNo ? `<th class="text-center" style="width: 5%">#</th>` : ""}
        ${activeCols.product ? `<th>${labels.product}</th>` : ""}
        ${activeCols.description ? `<th>${labels.description}</th>` : ""}
        ${activeCols.hsn ? `<th class="text-center" style="width: 12%">${labels.hsn}</th>` : ""}
        ${activeCols.qty ? `<th class="text-right" style="width: 8%">${labels.qty}</th>` : ""}
        ${activeCols.unit ? `<th class="text-center" style="width: 8%">${labels.unit}</th>` : ""}
        ${activeCols.rate ? `<th class="text-right" style="width: 12%">${labels.rate}</th>` : ""}
        ${activeCols.gst ? `<th class="text-right" style="width: 8%">${labels.gst}</th>` : ""}
        ${activeCols.discount ? `<th class="text-right" style="width: 8%">${labels.discount}</th>` : ""}
        ${activeCols.amount ? `<th class="text-right" style="width: 14%">${labels.amount}</th>` : ""}
      </tr>
    </thead>
    <tbody>
      ${data.items.map((item, idx) => {
        const rowAmount = (Number(item.qty) || 1) * (Number(item.rate) || 0);
        return `
          <tr>
            ${activeCols.srNo ? `<td class="text-center">${idx + 1}</td>` : ""}
            ${activeCols.product ? `<td><strong>${item.product}</strong></td>` : ""}
            ${activeCols.description ? `<td>${(item as any).description || (item.sku ? `SKU: ${item.sku}` : "Standard clinical grade item")}</td>` : ""}
            ${activeCols.hsn ? `<td class="text-center">${(item as any).hsn || "90189099"}</td>` : ""}
            ${activeCols.qty ? `<td class="text-right">${item.qty}</td>` : ""}
            ${activeCols.unit ? `<td class="text-center">${(item as any).unit || "Nos"}</td>` : ""}
            ${activeCols.rate ? `<td class="text-right">₹${Number(item.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>` : ""}
            ${activeCols.gst ? `<td class="text-right">${item.gst || 12}%</td>` : ""}
            ${activeCols.discount ? `<td class="text-right">0%</td>` : ""}
            ${activeCols.amount ? `<td class="text-right">₹${rowAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>` : ""}
          </tr>
        `;
      }).join("")}
    </tbody>
  </table>

  ${getWidgetHtml("below_table")}

  <div class="totals-wrapper">
    <table class="totals-table">
      <tr>
        <td>Subtotal:</td>
        <td class="text-right">₹${subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td>Estimated Tax (GST):</td>
        <td class="text-right">₹${estimatedTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
      ${data.discount > 0 ? `
      <tr>
        <td>Discount Rebate (${data.discount}%):</td>
        <td class="text-right">- ₹${discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>` : ""}
      <tr class="grand-total">
        <td>GRAND TOTAL:</td>
        <td class="text-right">₹${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>
  </div>

  ${getWidgetHtml("footer_top")}

  <div class="footer-grid">
    <div class="footer-section">
      <h5>Bank & Payment Details</h5>
      <p><strong>Bank A/C:</strong> ${cfg.company.bankDetails || "HDFC Bank · A/C: 502000123456"}<br />
         <strong>UPI ID:</strong> ${cfg.company.upiId || "operonai@hdfcbank"}<br />
         <strong>PAN:</strong> ${cfg.company.panNumber || "AABCM4521A"}</p>
    </div>
    <div class="footer-section">
      <h5>Terms & Conditions</h5>
      <p>${cfg.terms || "1. Validity: 15 Days from issue date.\n2. Payment: 100% advance along with PO."}</p>
    </div>
  </div>

  <div class="signature-block">
    <div class="signature-company">For ${cfg.company.name || "Operon AI Enterprise"}</div>
    ${cfg.company.authorizedSignature ? `<img src="${cfg.company.authorizedSignature}" style="max-height: 40px; margin-bottom: 8px;" alt="Signature"/>` : ""}
    <div class="signature-line">Authorized Signatory</div>
  </div>

  <script>
    window.onload = () => {
      setTimeout(() => {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
  `;

  const printWin = window.open("", "_blank", "width=900,height=1100");
  if (printWin) {
    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  }
}
