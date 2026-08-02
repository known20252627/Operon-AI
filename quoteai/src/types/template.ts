/* ══════════════════════════════════════════════
   QuoteAI — Quotation Template Data Models
   ══════════════════════════════════════════════ */

export type TemplateTheme = 
  | "modern"
  | "minimal"
  | "corporate"
  | "medical"
  | "government"
  | "professional"
  | "dark";

export type TemplateFont = "Inter" | "Roboto" | "Arial" | "Calibri" | "Times New Roman" | "Helvetica" | "Courier New";
export type PaperSize = "A4" | "Letter";
export type TableStyle = "modern" | "classic" | "striped" | "bordered" | "minimal";
export type HeaderStyle = "clean" | "banner" | "split" | "centered" | "minimal";
export type FontSizeScale = "compact" | "normal" | "spacious";
export type BorderRadiusScale = "none" | "sm" | "md" | "lg";

export interface ColumnVisibility {
  srNo: boolean;
  product: boolean;
  description: boolean;
  hsn: boolean;
  qty: boolean;
  unit: boolean;
  rate: boolean;
  gst: boolean;
  discount: boolean;
  amount: boolean;
}

export interface ColumnLabels {
  srNo: string;
  product: string;
  description: string;
  hsn: string;
  qty: string;
  unit: string;
  rate: string;
  gst: string;
  discount: string;
  amount: string;
}

export interface CompanyTemplateDetails {
  logo?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber?: string;
  panNumber?: string;
  bankDetails?: string;
  upiId?: string;
  authorizedSignature?: string;
}

export type WidgetType = 
  | "promo_banner" 
  | "scope_of_work" 
  | "warranty_seal" 
  | "qr_payment" 
  | "client_acceptance" 
  | "watermark" 
  | "highlight_box";

export type WidgetPosition = "above_table" | "below_table" | "footer_top" | "watermark";
export type WidgetStyle = "accent_fill" | "bordered" | "minimal" | "gradient" | "warning";

export interface TemplateWidget {
  id: string;
  type: WidgetType;
  title: string;
  enabled: boolean;
  content: string;
  position: WidgetPosition;
  style?: WidgetStyle;
}

export interface TemplateConfig {
  theme: TemplateTheme;
  primaryColor: string;
  accentColor: string;
  font: TemplateFont;
  paperSize: PaperSize;
  tableStyle: TableStyle;
  headerStyle: HeaderStyle;
  fontSizeScale?: FontSizeScale;
  borderRadius?: BorderRadiusScale;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  columns: ColumnVisibility;
  columnLabels: ColumnLabels;
  company: CompanyTemplateDetails;
  terms: string;
  footerNote: string;
  showAmountInWords?: boolean;
  widgets?: TemplateWidget[];
}

export interface QuotationTemplate {
  id: string;
  name: string;
  description?: string;
  theme: TemplateTheme;
  isDefault: boolean;
  isPreset?: boolean;
  config: TemplateConfig;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}
