import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

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
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const B = "#000000"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
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
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    letterSpacing: 1.5,
  },
  titleRight: {
    fontSize: 7,
    fontFamily: "Helvetica-Oblique",
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
    fontFamily: "Helvetica-Bold",
    color: "#555555",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  entityName: {
    fontFamily: "Helvetica-Bold",
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
    fontFamily: "Helvetica-Bold",
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
    fontFamily: "Helvetica-Bold",
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
    fontFamily: "Helvetica-Bold",
  },
  totalValue: {
    width: 68,
    textAlign: "right",
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 6,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
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
    fontFamily: "Helvetica-Bold",
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
    fontFamily: "Helvetica-Bold",
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
    fontFamily: "Helvetica-Oblique",
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
  const cgstAmt = subtotal * (cgstRate / 100)
  const sgstAmt = subtotal * (sgstRate / 100)
  const igstAmt = subtotal * (igstRate / 100)
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Title row (no border) ── */}
        <View style={styles.titleRow}>
          <Text style={{ width: 120, fontSize: 7 }} />
          <Text style={styles.titleCenter}>TAX INVOICE</Text>
          <Text style={[styles.titleRight, { width: 120 }]}>
            (ORIGINAL FOR RECIPIENT)
          </Text>
        </View>

        <View style={styles.outer}>
          {/* ── Seller / Invoice info ── */}
          <View style={styles.infoRow}>
            {/* Seller details */}
            <View style={styles.sellerBox}>
              <Text style={styles.sectionLabel}>Seller</Text>
              <Text style={styles.entityName}>{company.name}</Text>
              {companyDetailLines.map((line, i) => (
                <Text key={i} style={styles.detailLine}>
                  {line}
                </Text>
              ))}
            </View>

            {/* Invoice meta */}
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

          {/* Table header */}
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

          {/* Line item rows */}
          {lineItems.map((row, idx) => {
            const qty = parseFloat(row.quantity) || 0
            const rate = parseFloat(row.rate) || 0
            const amount = qty * rate
            return (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tdMuted, styles.colSI]}>{idx + 1}</Text>
                <Text style={[styles.tdText, styles.colDesc]}>
                  {row.description || "—"}
                </Text>
                <Text style={[styles.tdText, styles.colHsn]}>
                  {row.hsnSac || "—"}
                </Text>
                <Text style={[styles.tdText, styles.colQty]}>
                  {qty > 0 ? String(qty) : "—"}
                </Text>
                <Text style={[styles.tdText, styles.colRate]}>
                  {rate > 0 ? fmt(rate) : "—"}
                </Text>
                <Text style={[styles.tdText, styles.colAmount]}>
                  {amount > 0 ? fmt(amount) : "—"}
                </Text>
              </View>
            )
          })}

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

          {/* CGST sub-row */}
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
                    fontFamily: "Helvetica-Oblique",
                  },
                ]}
              >
                CGST @ {cgstRate}%
              </Text>
              <Text style={[styles.tdMuted, styles.colHsn]} />
              <Text style={[styles.tdMuted, styles.colQty]} />
              <Text style={[styles.tdMuted, styles.colRate]} />
              <Text style={[styles.tdText, styles.colAmount]}>
                {fmt(cgstAmt)}
              </Text>
            </View>
          )}

          {/* SGST sub-row */}
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
                    fontFamily: "Helvetica-Oblique",
                  },
                ]}
              >
                SGST @ {sgstRate}%
              </Text>
              <Text style={[styles.tdMuted, styles.colHsn]} />
              <Text style={[styles.tdMuted, styles.colQty]} />
              <Text style={[styles.tdMuted, styles.colRate]} />
              <Text style={[styles.tdText, styles.colAmount]}>
                {fmt(sgstAmt)}
              </Text>
            </View>
          )}

          {/* IGST sub-row */}
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
                    fontFamily: "Helvetica-Oblique",
                  },
                ]}
              >
                IGST @ {igstRate}%
              </Text>
              <Text style={[styles.tdMuted, styles.colHsn]} />
              <Text style={[styles.tdMuted, styles.colQty]} />
              <Text style={[styles.tdMuted, styles.colRate]} />
              <Text style={[styles.tdText, styles.colAmount]}>
                {fmt(igstAmt)}
              </Text>
            </View>
          )}

          {/* Rounded off sub-row */}
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
                    fontFamily: "Helvetica-Oblique",
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

          {/* Grand total row */}
          <View style={styles.totalRow}>
            <Text style={[styles.tdMuted, styles.colSI]} />
            <Text style={[styles.totalLabel]}>Total</Text>
            <Text style={styles.totalValue}>Rs. {fmt(grandTotal)}</Text>
          </View>

          {/* ── Amount in words ── */}
          <View style={styles.wordsRow}>
            <Text style={styles.wordsLabel}>Amount Chargeable (in words)</Text>
            <Text style={styles.wordsValue}>{numberToWords(grandTotal)}</Text>
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* ── Declaration / Authorised Signatory ── */}
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
        </View>

        {/* ── Footer (absolute bottom of page) ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            This is a Computer Generated Invoice
          </Text>
        </View>
      </Page>
    </Document>
  )
}
