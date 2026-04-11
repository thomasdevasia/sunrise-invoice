import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

import NotoSansRegular from "@/assets/fonts/NotoSans-Regular.ttf"
import NotoSansBold from "@/assets/fonts/NotoSans-Bold.ttf"
import NotoSansItalic from "@/assets/fonts/NotoSans-Italic.ttf"

Font.register({
  family: "NotoSans",
  fonts: [
    { src: NotoSansRegular, fontWeight: "normal", fontStyle: "normal" },
    { src: NotoSansBold, fontWeight: "bold", fontStyle: "normal" },
    { src: NotoSansItalic, fontWeight: "normal", fontStyle: "italic" },
  ],
})

// ─── Types ────────────────────────────────────────────────────────────────────

export type InvoiceCompany = {
  name: string
  emailPrimary: string
  emailSecondary: string
  phonePrimary: string
  phoneSecondary: string
  phoneLandline: string
  website: string
  pan: string
  gstin: string
  address: string
  state: string
  bankName: string
  bankAccountNumber: string
  bankBranch: string
  bankIfsc: string
}

export type InvoiceParty = {
  id?: string
  name: string
  emailPrimary: string
  emailSecondary: string
  phonePrimary: string
  phoneSecondary: string
  phoneLandline: string
  gstin: string
  address: string
  state: string
}

export type InvoiceLineItem = {
  description: string
  hsnSac: string
  quantity: string
  rate: string
}

export type InvoicePDFProps = {
  company: InvoiceCompany
  billTo: InvoiceParty
  shipTo: InvoiceParty
  invoiceNumber: string
  invoiceDate: Date
  transportMode?: string | null
  vehicleNumber?: string | null
  lineItems: InvoiceLineItem[]
  otherCharges?: {
    description: string
    amount: number
  }[]
  cgstPct: string
  sgstPct: string
  igstPct: string
  copyType?: "original" | "duplicate-transporter" | "triplicate-office"
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const B = "#000000"

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSans",
    fontSize: 8,
    color: "#111111",
    paddingTop: 28,
    paddingBottom: 36,
    paddingLeft: 32,
    paddingRight: 32,
  },

  // ── Outer wrapper (full border)
  outer: {
    borderWidth: 0.5,
    borderColor: B,
    flex: 1,
  },

  // ── Title row
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 6,
    paddingLeft: 10,
    paddingRight: 10,
  },
  titleCenter: {
    flex: 1,
    textAlign: "center",
    fontFamily: "NotoSans",
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 1.5,
  },
  titleRight: {
    fontSize: 7,
    fontFamily: "NotoSans",
    fontStyle: "italic",
    textAlign: "right",
  },

  // ── Seller / Invoice info row
  infoRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: B,
  },
  sellerBox: {
    flex: 3,
    borderRightWidth: 0.5,
    borderRightColor: B,
    padding: 8,
  },
  invoiceBox: {
    flex: 2,
    padding: 8,
  },

  // ── Buyer row (split Bill To / Ship To)
  buyerRow: {
    borderBottomWidth: 0.5,
    borderBottomColor: B,
    flexDirection: "row",
  },
  billToBox: {
    flex: 1,
    padding: 8,
    borderRightWidth: 0.5,
    borderRightColor: B,
  },
  shipToBox: {
    flex: 1,
    padding: 8,
  },

  // Section heading
  sectionLabel: {
    fontSize: 7,
    fontFamily: "NotoSans",
    fontWeight: "bold",
    color: "#555555",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  entityName: {
    fontFamily: "NotoSans",
    fontWeight: "bold",
    fontSize: 9,
    marginBottom: 2,
  },
  detailLine: {
    fontSize: 7,
    color: "#333333",
    marginBottom: 1,
  },

  // Invoice detail key/value pairs
  kvRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  kvKey: {
    fontSize: 7,
    color: "#555555",
    width: 72,
  },
  kvVal: {
    fontSize: 8,
    fontFamily: "NotoSans",
    fontWeight: "bold",
    flex: 1,
  },

  // ── Table header
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: B,
    backgroundColor: "#f5f5f5",
  },
  thText: {
    fontSize: 7,
    fontFamily: "NotoSans",
    fontWeight: "bold",
    textAlign: "center",
  },

  // ── Table row
  tableRow: {
    flexDirection: "row",
    minHeight: 20,
  },
  tableRowLast: {
    flexDirection: "row",
    minHeight: 20,
  },
  tdText: { fontSize: 8, color: "#111111" },
  tdMuted: { fontSize: 8, color: "#888888" },

  // Column widths (must sum to page content width)
  colSI: {
    width: 24,
    textAlign: "center",
    borderRightWidth: 0.5,
    borderRightColor: B,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 2,
    paddingRight: 2,
  },
  colDesc: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 6,
    paddingRight: 4,
    borderRightWidth: 0.5,
    borderRightColor: B,
  },
  colHsn: {
    width: 56,
    textAlign: "center",
    borderRightWidth: 0.5,
    borderRightColor: B,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 2,
    paddingRight: 2,
  },
  colQty: {
    width: 56,
    textAlign: "center",
    borderRightWidth: 0.5,
    borderRightColor: B,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 2,
    paddingRight: 2,
  },
  colRate: {
    width: 60,
    textAlign: "right",
    borderRightWidth: 0.5,
    borderRightColor: B,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 2,
    paddingRight: 4,
  },
  colAmount: {
    width: 68,
    textAlign: "right",
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 2,
    paddingRight: 6,
  },

  // ── Total row
  totalRow: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: B,
  },
  totalLabel: {
    flex: 1,
    textAlign: "right",
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 8,
    fontSize: 9,
    fontFamily: "NotoSans",
    fontWeight: "bold",
  },
  totalValue: {
    width: 68,
    textAlign: "right",
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 6,
    fontSize: 9,
    fontFamily: "NotoSans",
    fontWeight: "bold",
  },

  // ── Amount in words
  wordsRow: {
    borderTopWidth: 0.5,
    borderTopColor: B,
    padding: 7,
  },
  wordsLabel: {
    fontSize: 7,
    color: "#555555",
    marginBottom: 2,
  },
  wordsValue: {
    fontSize: 8,
    fontFamily: "NotoSans",
    fontWeight: "bold",
  },

  // ── Bank details row
  bankDetailsRow: {
    borderTopWidth: 0.5,
    borderTopColor: B,
    padding: 7,
  },
  bankDetailsTitle: {
    fontSize: 7,
    fontFamily: "NotoSans",
    fontWeight: "bold",
    marginBottom: 4,
  },
  bankDetailItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bankDetailKey: {
    fontSize: 7,
    color: "#333333",
    width: 80,
  },
  bankDetailColon: {
    fontSize: 7,
    color: "#333333",
    width: 10,
  },
  bankDetailVal: {
    fontSize: 7,
    fontFamily: "NotoSans",
    fontWeight: "bold",
    flex: 1,
  },

  // ── Declaration / Signatory row
  declarationRow: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: B,
    minHeight: 64,
  },
  declarationBox: {
    flex: 1,
    borderRightWidth: 0.5,
    borderRightColor: B,
    padding: 7,
  },
  declarationTitle: {
    fontSize: 7,
    fontFamily: "NotoSans",
    fontWeight: "bold",
    marginBottom: 3,
  },
  declarationText: {
    fontSize: 7,
    color: "#444444",
    lineHeight: 1.5,
  },
  signatoryBox: {
    width: 160,
    padding: 7,
    justifyContent: "space-between",
    alignItems: "center",
  },
  signatoryLabel: {
    fontSize: 7,
    color: "#444444",
    textAlign: "center",
    width: "100%",
  },

  // ── Footer
  footer: {
    position: "absolute",
    bottom: 12,
    left: 32,
    right: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#888888",
    fontFamily: "NotoSans",
    fontStyle: "italic",
  },
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  })
}

function printable(value?: string | null) {
  const text = value?.trim()
  return text ? text : "-"
}

// ── Number to Indian words ────────────────────────────────────────────────────

const _ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
]
const _tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
]

function _twoDigit(n: number): string {
  if (n === 0) return ""
  if (n < 20) return _ones[n]
  return _tens[Math.floor(n / 10)] + (n % 10 ? " " + _ones[n % 10] : "")
}

function _threeDigit(n: number): string {
  if (n === 0) return ""
  if (n < 100) return _twoDigit(n)
  return (
    _ones[Math.floor(n / 100)] +
    " Hundred" +
    (n % 100 ? " " + _twoDigit(n % 100) : "")
  )
}

function numberToWords(amount: number): string {
  const rupees = Math.floor(Math.abs(amount))
  const paiseRaw = Math.round((Math.abs(amount) - rupees) * 100)
  const paise = paiseRaw % 100

  const parts: string[] = []

  const crore = Math.floor(rupees / 10_000_000)
  const afterCrore = rupees % 10_000_000
  const lakh = Math.floor(afterCrore / 100_000)
  const afterLakh = afterCrore % 100_000
  const thousand = Math.floor(afterLakh / 1_000)
  const remainder = afterLakh % 1_000

  if (crore) parts.push(_threeDigit(crore) + " Crore")
  if (lakh) parts.push(_twoDigit(lakh) + " Lakh")
  if (thousand) parts.push(_twoDigit(thousand) + " Thousand")
  if (remainder) parts.push(_threeDigit(remainder))

  const rupeeWords = parts.length ? parts.join(" ") : "Zero"
  const base = `INR ${rupeeWords}`

  if (paise > 0) {
    return `${base} and ${_twoDigit(paise)} Paise Only`
  }
  return `${base} Only`
}

// ─── Pagination ──────────────────────────────────────────────────────────────

// Height constants (pt) derived from styles above
const PAGE_HEIGHT = 777.89 // A4 (841.89) minus paddingTop(28) + paddingBottom(36)
const TITLE_HEIGHT = 25
const OUTER_BORDER = 1
const INFO_ROW_BASE = 40 // padding(8*2) + sectionLabel(~11) + entityName(~13)
const INFO_ROW_LINE = 9.5 // per detail line
const INVOICE_BOX_HEIGHT = 78 // fixed: 4 kv rows + padding + label
const BUYER_ROW_BASE = 40
const BUYER_ROW_LINE = 9.5
const TABLE_HEADER_HEIGHT = 25
const LINE_ITEM_HEIGHT = 20
const GRAND_TOTAL_HEIGHT = 25 // borderTop + padding + text
const WORDS_ROW_HEIGHT = 38 // borderTop + padding + label + value
const BANK_DETAILS_BASE = 26 // borderTop + padding + title
const BANK_DETAIL_LINE = 12 // each bank detail item
const DECLARATION_HEIGHT = 68 // borderTop + minHeight(64)
const SUMMARY_ROW_HEIGHT = 20
const SAFETY_MARGIN = 40

function paginateLineItems(
  lineItems: InvoiceLineItem[],
  itemsPerFullPage: number,
  itemsPerLastPage: number
): InvoiceLineItem[][] {
  if (lineItems.length <= itemsPerLastPage) {
    return [lineItems]
  }

  const chunks: InvoiceLineItem[][] = []
  let remaining = [...lineItems]

  while (remaining.length > 0) {
    if (remaining.length <= itemsPerLastPage) {
      chunks.push(remaining)
      remaining = []
    } else {
      chunks.push(remaining.slice(0, itemsPerFullPage))
      remaining = remaining.slice(itemsPerFullPage)
    }
  }

  return chunks
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InvoiceTableHeader() {
  return (
    <View style={styles.tableHeader}>
      <Text style={[styles.thText, styles.colSI]}>SI{"\n"}No.</Text>
      <Text style={[styles.thText, styles.colDesc, { paddingLeft: 6 }]}>
        Description of Goods / Services
      </Text>
      <Text style={[styles.thText, styles.colHsn]}>HSN/SAC</Text>
      <Text style={[styles.thText, styles.colQty]}>Quantity</Text>
      <Text style={[styles.thText, styles.colRate]}>Rate</Text>
      <Text style={[styles.thText, styles.colAmount]}>Amount</Text>
    </View>
  )
}

function TableSummaryRows({
  subtotal,
  visibleOtherCharges,
  cgstRate,
  sgstRate,
  igstRate,
  cgstAmt,
  sgstAmt,
  igstAmt,
  roundedOff,
}: {
  subtotal: number
  visibleOtherCharges: { description: string; amount: number }[]
  cgstRate: number
  sgstRate: number
  igstRate: number
  cgstAmt: number
  sgstAmt: number
  igstAmt: number
  roundedOff: number
}) {
  return (
    <>
      {/* Subtotal row */}
      <View style={styles.tableRow}>
        <Text style={[styles.tdMuted, styles.colSI]} />
        <Text
          style={[
            styles.tdText,
            styles.colDesc,
            {
              textAlign: "right",
              paddingRight: 8,
              fontWeight: "bold",
            },
          ]}
        >
          Subtotal
        </Text>
        <Text style={[styles.tdMuted, styles.colHsn]} />
        <Text style={[styles.tdMuted, styles.colQty]} />
        <Text style={[styles.tdMuted, styles.colRate]} />
        <Text
          style={[
            styles.tdText,
            styles.colAmount,
            {
              fontWeight: "bold",
              borderTopWidth: 0.5,
              borderTopColor: B,
            },
          ]}
        >
          {fmt(subtotal)}
        </Text>
      </View>

      {/* Other charges */}
      {visibleOtherCharges.map((charge, idx) => (
        <View key={`charge-${idx}`} style={styles.tableRow}>
          <Text style={[styles.tdMuted, styles.colSI]} />
          <Text
            style={[
              styles.tdText,
              styles.colDesc,
              { textAlign: "right", paddingRight: 8 },
            ]}
          >
            {charge.description || "Other Charge"}
          </Text>
          <Text style={[styles.tdMuted, styles.colHsn]} />
          <Text style={[styles.tdMuted, styles.colQty]} />
          <Text style={[styles.tdMuted, styles.colRate]} />
          <Text style={[styles.tdText, styles.colAmount]}>
            {fmt(charge.amount)}
          </Text>
        </View>
      ))}

      {/* Separator line between other charges and taxes */}
      <View style={{ flexDirection: "row" }}>
        <View style={[styles.colSI, { minHeight: 0 }]} />
        <View style={[styles.colDesc, { minHeight: 0 }]} />
        <View style={[styles.colHsn, { minHeight: 0 }]} />
        <View style={[styles.colQty, { minHeight: 0 }]} />
        <View style={[styles.colRate, { minHeight: 0 }]} />
        <View
          style={[
            styles.colAmount,
            { minHeight: 0, borderTopWidth: 0.5, borderTopColor: B },
          ]}
        />
      </View>

      {/* CGST */}
      {cgstRate > 0 && (
        <View style={styles.tableRow}>
          <Text style={[styles.tdMuted, styles.colSI]} />
          <Text
            style={[
              styles.tdText,
              styles.colDesc,
              {
                textAlign: "right",
                paddingRight: 8,
                fontStyle: "italic",
              },
            ]}
          >
            CGST @ {cgstRate}%
          </Text>
          <Text style={[styles.tdMuted, styles.colHsn]} />
          <Text style={[styles.tdMuted, styles.colQty]} />
          <Text style={[styles.tdMuted, styles.colRate]} />
          <Text style={[styles.tdText, styles.colAmount]}>{fmt(cgstAmt)}</Text>
        </View>
      )}

      {/* SGST */}
      {sgstRate > 0 && (
        <View style={styles.tableRow}>
          <Text style={[styles.tdMuted, styles.colSI]} />
          <Text
            style={[
              styles.tdText,
              styles.colDesc,
              {
                textAlign: "right",
                paddingRight: 8,
                fontStyle: "italic",
              },
            ]}
          >
            SGST @ {sgstRate}%
          </Text>
          <Text style={[styles.tdMuted, styles.colHsn]} />
          <Text style={[styles.tdMuted, styles.colQty]} />
          <Text style={[styles.tdMuted, styles.colRate]} />
          <Text style={[styles.tdText, styles.colAmount]}>{fmt(sgstAmt)}</Text>
        </View>
      )}

      {/* IGST */}
      {igstRate > 0 && (
        <View style={styles.tableRow}>
          <Text style={[styles.tdMuted, styles.colSI]} />
          <Text
            style={[
              styles.tdText,
              styles.colDesc,
              {
                textAlign: "right",
                paddingRight: 8,
                fontStyle: "italic",
              },
            ]}
          >
            IGST @ {igstRate}%
          </Text>
          <Text style={[styles.tdMuted, styles.colHsn]} />
          <Text style={[styles.tdMuted, styles.colQty]} />
          <Text style={[styles.tdMuted, styles.colRate]} />
          <Text style={[styles.tdText, styles.colAmount]}>{fmt(igstAmt)}</Text>
        </View>
      )}

      {/* Rounded off */}
      {Math.abs(roundedOff) >= 0.005 && (
        <View style={styles.tableRowLast}>
          <Text style={[styles.tdMuted, styles.colSI]} />
          <Text
            style={[
              styles.tdText,
              styles.colDesc,
              {
                textAlign: "right",
                paddingRight: 8,
                fontStyle: "italic",
              },
            ]}
          >
            Rounded Off
          </Text>
          <Text style={[styles.tdMuted, styles.colHsn]} />
          <Text style={[styles.tdMuted, styles.colQty]} />
          <Text style={[styles.tdMuted, styles.colRate]} />
          <Text style={[styles.tdText, styles.colAmount]}>
            {fmt(roundedOff)}
          </Text>
        </View>
      )}
    </>
  )
}

function InvoiceFooterSections({
  grandTotal,
  company,
  isLastPage,
}: {
  grandTotal: number
  company: InvoiceCompany
  isLastPage: boolean
}) {
  return (
    <>
      {/* Grand total row — value only on last page */}
      <View style={styles.totalRow}>
        <Text style={[styles.tdMuted, styles.colSI]} />
        <Text style={[styles.totalLabel]}>Total</Text>
        <Text style={styles.totalValue}>
          {isLastPage ? `₹ ${fmt(grandTotal)}` : "—"}
        </Text>
      </View>

      {/* Amount in words — only on last page */}
      <View style={styles.wordsRow}>
        <Text style={styles.wordsLabel}>Amount Chargeable (in words)</Text>
        <Text style={styles.wordsValue}>
          {isLastPage ? numberToWords(grandTotal) : "—"}
        </Text>
      </View>

      {/* Bank Details */}
      {(company.bankName ||
        company.bankAccountNumber ||
        company.bankBranch ||
        company.bankIfsc) && (
        <View style={styles.bankDetailsRow}>
          <Text style={styles.bankDetailsTitle}>Company's Bank Details</Text>
          {company.bankName ? (
            <View style={styles.bankDetailItem}>
              <Text style={styles.bankDetailKey}>Bank Name</Text>
              <Text style={styles.bankDetailColon}>:</Text>
              <Text style={styles.bankDetailVal}>{company.bankName}</Text>
            </View>
          ) : null}
          {company.bankAccountNumber ? (
            <View style={styles.bankDetailItem}>
              <Text style={styles.bankDetailKey}>A/c No.</Text>
              <Text style={styles.bankDetailColon}>:</Text>
              <Text style={styles.bankDetailVal}>
                {company.bankAccountNumber}
              </Text>
            </View>
          ) : null}
          {company.bankBranch || company.bankIfsc ? (
            <View style={styles.bankDetailItem}>
              <Text style={styles.bankDetailKey}>Branch & IFS Code</Text>
              <Text style={styles.bankDetailColon}>:</Text>
              <Text style={styles.bankDetailVal}>
                {[company.bankBranch, company.bankIfsc]
                  .filter(Boolean)
                  .join(" & ")}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Declaration / Authorised Signatory */}
      <View style={styles.declarationRow}>
        <View style={styles.declarationBox}>
          <Text style={styles.declarationTitle}>Declaration</Text>
          <Text style={styles.declarationText}>
            We declare that this invoice shows the actual price of the goods
            described and that all particulars are true and correct.
          </Text>
        </View>
        <View style={styles.signatoryBox}>
          <Text
            style={{
              fontSize: 7,
              color: "#444444",
              alignSelf: "flex-start",
            }}
          >
            for {company.name}
          </Text>
          <Text style={styles.signatoryLabel}>Authorised Signatory</Text>
        </View>
      </View>
    </>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InvoicePDFDocument({
  company,
  billTo,
  shipTo,
  invoiceNumber,
  invoiceDate,
  transportMode,
  vehicleNumber,
  lineItems,
  otherCharges = [],
  cgstPct,
  sgstPct,
  igstPct,
  copyType = "original",
}: InvoicePDFProps) {
  const subtotal = lineItems.reduce(
    (sum, r) => sum + (parseFloat(r.quantity) || 0) * (parseFloat(r.rate) || 0),
    0
  )
  const visibleOtherCharges = otherCharges.filter(
    (charge) => charge.description.trim() || charge.amount > 0
  )
  const otherChargesTotal = visibleOtherCharges.reduce(
    (sum, charge) => sum + charge.amount,
    0
  )
  const cgstRate = parseFloat(cgstPct) || 0
  const sgstRate = parseFloat(sgstPct) || 0
  const igstRate = parseFloat(igstPct) || 0
  const taxableAmount = subtotal + otherChargesTotal
  const cgstAmt = taxableAmount * (cgstRate / 100)
  const sgstAmt = taxableAmount * (sgstRate / 100)
  const igstAmt = taxableAmount * (igstRate / 100)
  const exactTotal = subtotal + otherChargesTotal + cgstAmt + sgstAmt + igstAmt
  const grandTotal = Math.ceil(exactTotal)
  const roundedOff = grandTotal - exactTotal

  const companyDetailLines = [
    company.address,
    company.state ? `State: ${company.state}` : "",
    company.pan ? `PAN: ${company.pan}` : "",
    company.gstin ? `GSTIN: ${company.gstin}` : "",
    company.phonePrimary ? `Ph: ${company.phonePrimary}` : "",
    company.phoneSecondary ? `Ph 2: ${company.phoneSecondary}` : "",
    company.phoneLandline ? `Landline: ${company.phoneLandline}` : "",
    company.emailPrimary ? `Email: ${company.emailPrimary}` : "",
    company.emailSecondary ? `Email 2: ${company.emailSecondary}` : "",
    company.website ? `Web: ${company.website}` : "",
  ].filter(Boolean)

  const billToLines = [
    billTo.address,
    billTo.state ? `State: ${billTo.state}` : "",
    billTo.gstin ? `GSTIN: ${billTo.gstin}` : "",
    billTo.phonePrimary ? `Ph: ${billTo.phonePrimary}` : "",
    billTo.phoneSecondary ? `Ph 2: ${billTo.phoneSecondary}` : "",
    billTo.phoneLandline ? `Landline: ${billTo.phoneLandline}` : "",
    billTo.emailPrimary ? `Email: ${billTo.emailPrimary}` : "",
    billTo.emailSecondary ? `Email 2: ${billTo.emailSecondary}` : "",
  ].filter(Boolean)

  const shipToLines = [
    shipTo.address,
    shipTo.state ? `State: ${shipTo.state}` : "",
    shipTo.gstin ? `GSTIN: ${shipTo.gstin}` : "",
    shipTo.phonePrimary ? `Ph: ${shipTo.phonePrimary}` : "",
    shipTo.phoneSecondary ? `Ph 2: ${shipTo.phoneSecondary}` : "",
    shipTo.phoneLandline ? `Landline: ${shipTo.phoneLandline}` : "",
    shipTo.emailPrimary ? `Email: ${shipTo.emailPrimary}` : "",
    shipTo.emailSecondary ? `Email 2: ${shipTo.emailSecondary}` : "",
  ].filter(Boolean)

  // ── Pagination ──
  const sellerHeight = Math.max(
    INFO_ROW_BASE + companyDetailLines.length * INFO_ROW_LINE,
    INVOICE_BOX_HEIGHT
  )
  const buyerHeight =
    BUYER_ROW_BASE +
    Math.max(billToLines.length, shipToLines.length) * BUYER_ROW_LINE
  const chromeHeight =
    TITLE_HEIGHT +
    OUTER_BORDER +
    sellerHeight +
    buyerHeight +
    TABLE_HEADER_HEIGHT
  console.log("chromeHeight", chromeHeight)
  console.log("sellerHeight", sellerHeight)
  console.log("buyerHeight", buyerHeight)
  console.log("TABLE_HEADER_HEIGHT", TABLE_HEADER_HEIGHT)
  console.log("SAFETY_MARGIN", SAFETY_MARGIN)

  const hasBankDetails =
    company.bankName ||
    company.bankAccountNumber ||
    company.bankBranch ||
    company.bankIfsc
  const bankDetailLineCount =
    (company.bankName ? 1 : 0) +
    (company.bankAccountNumber ? 1 : 0) +
    (company.bankBranch || company.bankIfsc ? 1 : 0)
  const bankHeight = hasBankDetails
    ? BANK_DETAILS_BASE + bankDetailLineCount * BANK_DETAIL_LINE
    : 0

  const footerSectionsHeight =
    GRAND_TOTAL_HEIGHT + WORDS_ROW_HEIGHT + bankHeight + DECLARATION_HEIGHT

  // bodySpace = space available for the flowing rows (line items + summary rows).
  // footer sections (grand total, words, bank, declaration) are fixed on every page
  // and are already deducted here.
  const bodySpace = PAGE_HEIGHT - chromeHeight - SAFETY_MARGIN - footerSectionsHeight
  console.log("bodySpace", bodySpace)

  // ── Build a unified flat list of all rows that will flow/paginate together ──
  type PdfRow =
    | { kind: "lineItem"; item: InvoiceLineItem; globalIndex: number }
    | { kind: "subtotal" }
    | { kind: "otherCharge"; description: string; amount: number }
    | { kind: "cgst"; rate: number; amount: number }
    | { kind: "sgst"; rate: number; amount: number }
    | { kind: "igst"; rate: number; amount: number }
    | { kind: "roundedOff"; amount: number }

  const allRows: PdfRow[] = [
    ...lineItems.map((item, i) => ({
      kind: "lineItem" as const,
      item,
      globalIndex: i,
    })),
    { kind: "subtotal" as const },
    ...visibleOtherCharges.map((c) => ({
      kind: "otherCharge" as const,
      description: c.description,
      amount: c.amount,
    })),
    ...(cgstRate > 0 ? [{ kind: "cgst" as const, rate: cgstRate, amount: cgstAmt }] : []),
    ...(sgstRate > 0 ? [{ kind: "sgst" as const, rate: sgstRate, amount: sgstAmt }] : []),
    ...(igstRate > 0 ? [{ kind: "igst" as const, rate: igstRate, amount: igstAmt }] : []),
    ...(Math.abs(roundedOff) >= 0.005
      ? [{ kind: "roundedOff" as const, amount: roundedOff }]
      : []),
  ]

  const rowsPerPage = Math.max(1, Math.floor(bodySpace / LINE_ITEM_HEIGHT))
  console.log("rowsPerPage", rowsPerPage)

  // Slice allRows into uniform pages
  const chunks: PdfRow[][] = []
  for (let i = 0; i < allRows.length; i += rowsPerPage) {
    chunks.push(allRows.slice(i, i + rowsPerPage))
  }
  const totalPages = chunks.length
  console.log("totalPages", totalPages)

  return (
    <Document>
      {chunks.map((chunk, pageIdx) => {
        const isLastPage = pageIdx === totalPages - 1

        return (
          <Page key={pageIdx} size="A4" style={styles.page}>
            {/* ── Title row ── */}
            <View style={styles.titleRow}>
              <Text style={{ width: 120, fontSize: 7 }}>
                {totalPages > 1 ? `Page ${pageIdx + 1} of ${totalPages}` : ""}
              </Text>
              <Text style={styles.titleCenter}>TAX INVOICE</Text>
              <Text style={[styles.titleRight, { width: 120 }]}>
                {copyType === "duplicate-transporter"
                  ? "(DUPLICATE COPY FOR TRANSPORTER)"
                  : copyType === "triplicate-office"
                    ? "(TRIPLICATE COPY FOR OFFICE)"
                    : "(ORIGINAL FOR RECIPIENT)"}
              </Text>
            </View>

            <View style={styles.outer}>
              {/* ── Seller / Invoice info ── */}
              <View style={styles.infoRow}>
                <View style={styles.sellerBox}>
                  <Text style={styles.sectionLabel}>Seller</Text>
                  <Text style={styles.entityName}>{company.name}</Text>
                  {companyDetailLines.map((line, i) => (
                    <Text key={i} style={styles.detailLine}>
                      {line}
                    </Text>
                  ))}
                </View>

                <View style={styles.invoiceBox}>
                  <Text style={styles.sectionLabel}>Invoice Details</Text>
                  <View style={styles.kvRow}>
                    <Text style={styles.kvKey}>Invoice No.</Text>
                    <Text style={styles.kvVal}>{invoiceNumber}</Text>
                  </View>
                  <View style={styles.kvRow}>
                    <Text style={styles.kvKey}>Date</Text>
                    <Text style={styles.kvVal}>{formatDate(invoiceDate)}</Text>
                  </View>
                  <View style={styles.kvRow}>
                    <Text style={styles.kvKey}>Transport</Text>
                    <Text style={styles.kvVal}>{printable(transportMode)}</Text>
                  </View>
                  <View style={styles.kvRow}>
                    <Text style={styles.kvKey}>Vehicle No.</Text>
                    <Text style={styles.kvVal}>{printable(vehicleNumber)}</Text>
                  </View>
                </View>
              </View>

              {/* ── Buyer row ── */}
              <View style={styles.buyerRow}>
                <View style={styles.billToBox}>
                  <Text style={styles.sectionLabel}>Bill To</Text>
                  <Text style={styles.entityName}>{billTo.name}</Text>
                  {billToLines.map((line, i) => (
                    <Text key={i} style={styles.detailLine}>
                      {line}
                    </Text>
                  ))}
                </View>
                <View style={styles.shipToBox}>
                  <Text style={styles.sectionLabel}>Ship To</Text>
                  <Text style={styles.entityName}>{shipTo.name}</Text>
                  {shipToLines.map((line, i) => (
                    <Text key={i} style={styles.detailLine}>
                      {line}
                    </Text>
                  ))}
                </View>
              </View>

              {/* ── Line items table ── */}
              <View style={{ flex: 1 }}>
                <InvoiceTableHeader />

                {/* All rows flow together: line items + summary rows */}
                {chunk.map((row, idx) => {
                  if (row.kind === "lineItem") {
                    const qty = parseFloat(row.item.quantity) || 0
                    const rate = parseFloat(row.item.rate) || 0
                    const amount = qty * rate
                    return (
                      <View key={idx} style={styles.tableRow}>
                        <Text style={[styles.tdMuted, styles.colSI]}>
                          {row.globalIndex + 1}
                        </Text>
                        <Text style={[styles.tdText, styles.colDesc]}>
                          {row.item.description || "\u2014"}
                        </Text>
                        <Text style={[styles.tdText, styles.colHsn]}>
                          {row.item.hsnSac || "\u2014"}
                        </Text>
                        <Text style={[styles.tdText, styles.colQty]}>
                          {qty > 0 ? String(qty) : "\u2014"}
                        </Text>
                        <Text style={[styles.tdText, styles.colRate]}>
                          {rate > 0 ? fmt(rate) : "\u2014"}
                        </Text>
                        <Text style={[styles.tdText, styles.colAmount]}>
                          {amount > 0 ? fmt(amount) : "\u2014"}
                        </Text>
                      </View>
                    )
                  }

                  if (row.kind === "subtotal") {
                    return (
                      <View key={idx} style={styles.tableRow}>
                        <Text style={[styles.tdMuted, styles.colSI]} />
                        <Text
                          style={[
                            styles.tdText,
                            styles.colDesc,
                            { textAlign: "right", paddingRight: 8, fontWeight: "bold" },
                          ]}
                        >
                          Subtotal
                        </Text>
                        <Text style={[styles.tdMuted, styles.colHsn]} />
                        <Text style={[styles.tdMuted, styles.colQty]} />
                        <Text style={[styles.tdMuted, styles.colRate]} />
                        <Text
                          style={[
                            styles.tdText,
                            styles.colAmount,
                            { fontWeight: "bold", borderTopWidth: 0.5, borderTopColor: B },
                          ]}
                        >
                          {fmt(subtotal)}
                        </Text>
                      </View>
                    )
                  }

                  if (row.kind === "otherCharge") {
                    return (
                      <View key={idx} style={styles.tableRow}>
                        <Text style={[styles.tdMuted, styles.colSI]} />
                        <Text
                          style={[
                            styles.tdText,
                            styles.colDesc,
                            { textAlign: "right", paddingRight: 8 },
                          ]}
                        >
                          {row.description || "Other Charge"}
                        </Text>
                        <Text style={[styles.tdMuted, styles.colHsn]} />
                        <Text style={[styles.tdMuted, styles.colQty]} />
                        <Text style={[styles.tdMuted, styles.colRate]} />
                        <Text style={[styles.tdText, styles.colAmount]}>
                          {fmt(row.amount)}
                        </Text>
                      </View>
                    )
                  }

                  if (row.kind === "cgst") {
                    return (
                      <View key={idx} style={styles.tableRow}>
                        <Text style={[styles.tdMuted, styles.colSI]} />
                        <Text
                          style={[
                            styles.tdText,
                            styles.colDesc,
                            { textAlign: "right", paddingRight: 8, fontStyle: "italic" },
                          ]}
                        >
                          CGST @ {row.rate}%
                        </Text>
                        <Text style={[styles.tdMuted, styles.colHsn]} />
                        <Text style={[styles.tdMuted, styles.colQty]} />
                        <Text style={[styles.tdMuted, styles.colRate]} />
                        <Text style={[styles.tdText, styles.colAmount]}>
                          {fmt(row.amount)}
                        </Text>
                      </View>
                    )
                  }

                  if (row.kind === "sgst") {
                    return (
                      <View key={idx} style={styles.tableRow}>
                        <Text style={[styles.tdMuted, styles.colSI]} />
                        <Text
                          style={[
                            styles.tdText,
                            styles.colDesc,
                            { textAlign: "right", paddingRight: 8, fontStyle: "italic" },
                          ]}
                        >
                          SGST @ {row.rate}%
                        </Text>
                        <Text style={[styles.tdMuted, styles.colHsn]} />
                        <Text style={[styles.tdMuted, styles.colQty]} />
                        <Text style={[styles.tdMuted, styles.colRate]} />
                        <Text style={[styles.tdText, styles.colAmount]}>
                          {fmt(row.amount)}
                        </Text>
                      </View>
                    )
                  }

                  if (row.kind === "igst") {
                    return (
                      <View key={idx} style={styles.tableRow}>
                        <Text style={[styles.tdMuted, styles.colSI]} />
                        <Text
                          style={[
                            styles.tdText,
                            styles.colDesc,
                            { textAlign: "right", paddingRight: 8, fontStyle: "italic" },
                          ]}
                        >
                          IGST @ {row.rate}%
                        </Text>
                        <Text style={[styles.tdMuted, styles.colHsn]} />
                        <Text style={[styles.tdMuted, styles.colQty]} />
                        <Text style={[styles.tdMuted, styles.colRate]} />
                        <Text style={[styles.tdText, styles.colAmount]}>
                          {fmt(row.amount)}
                        </Text>
                      </View>
                    )
                  }

                  if (row.kind === "roundedOff") {
                    return (
                      <View key={idx} style={styles.tableRowLast}>
                        <Text style={[styles.tdMuted, styles.colSI]} />
                        <Text
                          style={[
                            styles.tdText,
                            styles.colDesc,
                            { textAlign: "right", paddingRight: 8, fontStyle: "italic" },
                          ]}
                        >
                          Rounded Off
                        </Text>
                        <Text style={[styles.tdMuted, styles.colHsn]} />
                        <Text style={[styles.tdMuted, styles.colQty]} />
                        <Text style={[styles.tdMuted, styles.colRate]} />
                        <Text style={[styles.tdText, styles.colAmount]}>
                          {fmt(row.amount)}
                        </Text>
                      </View>
                    )
                  }

                  return null
                })}

                {/* Filler row — extends column lines through remaining space */}
                <View style={{ flexDirection: "row", flex: 1 }}>
                  <View style={styles.colSI} />
                  <View style={styles.colDesc} />
                  <View style={styles.colHsn} />
                  <View style={styles.colQty} />
                  <View style={styles.colRate} />
                  <View style={styles.colAmount} />
                </View>
              </View>
              {/* end table wrapper */}

              {/* Footer sections on every page */}
              <InvoiceFooterSections
                grandTotal={grandTotal}
                company={company}
                isLastPage={isLastPage}
              />
            </View>

            {/* ── Footer (absolute bottom of page) ── */}
            <View style={styles.footer} fixed>
              <Text style={styles.footerText}>
                SUBJECT TO DELHI JURISDICTION
              </Text>
              <Text style={styles.footerText}>
                This is a Computer Generated Invoice
              </Text>
            </View>
          </Page>
        )
      })}
    </Document>
  )
}
