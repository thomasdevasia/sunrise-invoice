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

export type InvoiceClient = {
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
  quantity: string
  rate: string
}

export type InvoicePDFProps = {
  company: InvoiceCompany
  client: InvoiceClient
  invoiceNumber: string
  invoiceDate: Date
  lineItems: InvoiceLineItem[]
  cgstPct: string
  sgstPct: string
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#111111",
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 44,
    paddingRight: 44,
    lineHeight: 1.4,
  },

  // ── Company header
  header: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
    color: "#111111",
  },
  companyMeta: {
    fontSize: 8,
    color: "#555555",
    marginBottom: 1,
  },

  // ── TAX INVOICE title bar
  titleBar: {
    backgroundColor: "#111111",
    color: "#ffffff",
    textAlign: "center",
    paddingTop: 7,
    paddingBottom: 7,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    letterSpacing: 2.5,
    marginBottom: 16,
  },

  // ── Two-column meta row (invoice info | bill to)
  metaRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  metaBox: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "#dddddd",
    borderRadius: 3,
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 10,
    paddingRight: 10,
  },
  metaLabel: {
    fontSize: 7,
    color: "#999999",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 10,
    color: "#111111",
    fontFamily: "Helvetica-Bold",
  },
  metaSubValue: {
    fontSize: 8,
    color: "#555555",
    marginTop: 2,
  },

  // ── Line items table
  table: {
    borderWidth: 0.5,
    borderColor: "#dddddd",
    borderRadius: 3,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 0.5,
    borderBottomColor: "#dddddd",
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 10,
    paddingRight: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eeeeee",
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 10,
    paddingRight: 10,
  },
  tableRowLast: {
    flexDirection: "row",
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 10,
    paddingRight: 10,
  },
  colNum: { width: 22 },
  colDesc: { flex: 1, paddingRight: 8 },
  colQty: { width: 48, textAlign: "right" },
  colRate: { width: 62, textAlign: "right" },
  colAmount: { width: 72, textAlign: "right" },
  thText: {
    fontSize: 7,
    color: "#888888",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tdText: {
    fontSize: 9,
    color: "#111111",
  },
  tdMuted: {
    fontSize: 9,
    color: "#aaaaaa",
  },

  // ── Totals
  totalsBlock: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  totalRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  totalLabel: {
    fontSize: 8,
    color: "#555555",
    width: 110,
    textAlign: "right",
    paddingRight: 12,
  },
  totalValue: {
    fontSize: 9,
    color: "#111111",
    width: 80,
    textAlign: "right",
    fontFamily: "Helvetica",
  },
  dividerRow: {
    width: 202,
    borderBottomWidth: 0.5,
    borderBottomColor: "#cccccc",
    marginTop: 4,
    marginBottom: 6,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    width: 110,
    textAlign: "right",
    paddingRight: 12,
  },
  grandTotalValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    width: 80,
    textAlign: "right",
  },

  // ── Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    borderTopWidth: 0.5,
    borderTopColor: "#eeeeee",
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: "#aaaaaa",
    textAlign: "center",
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
    year: "numeric",
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InvoicePDFDocument({
  company,
  client,
  invoiceNumber,
  invoiceDate,
  lineItems,
  cgstPct,
  sgstPct,
}: InvoicePDFProps) {
  const subtotal = lineItems.reduce(
    (sum, r) => sum + (parseFloat(r.quantity) || 0) * (parseFloat(r.rate) || 0),
    0
  )
  const cgstRate = parseFloat(cgstPct) || 0
  const sgstRate = parseFloat(sgstPct) || 0
  const cgstAmt = subtotal * (cgstRate / 100)
  const sgstAmt = subtotal * (sgstRate / 100)
  const grandTotal = subtotal + cgstAmt + sgstAmt

  // Company detail lines (only non-empty)
  const companyLines = [
    [company.address, company.state].filter(Boolean).join(", "),
    company.gstin ? `GSTIN: ${company.gstin}` : "",
    company.pan ? `PAN: ${company.pan}` : "",
    company.phonePrimary ? `Phone: ${company.phonePrimary}` : "",
    company.emailPrimary ? `Email: ${company.emailPrimary}` : "",
    company.website ? `Web: ${company.website}` : "",
  ].filter(Boolean)

  // Client detail lines (only non-empty)
  const clientLines = [
    [client.address, client.state].filter(Boolean).join(", "),
    client.gstin ? `GSTIN: ${client.gstin}` : "",
    client.phonePrimary ? `Phone: ${client.phonePrimary}` : "",
    client.emailPrimary ? `Email: ${client.emailPrimary}` : "",
  ].filter(Boolean)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Company Header ── */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{company.name}</Text>
          {companyLines.map((line, i) => (
            <Text key={i} style={styles.companyMeta}>
              {line}
            </Text>
          ))}
        </View>

        {/* ── TAX INVOICE bar ── */}
        <Text style={styles.titleBar}>TAX INVOICE</Text>

        {/* ── Invoice meta + Bill To ── */}
        <View style={styles.metaRow}>
          {/* Invoice number & date */}
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Invoice Number</Text>
            <Text style={styles.metaValue}>{invoiceNumber}</Text>
            <Text style={[styles.metaSubValue, { marginTop: 8 }]}>
              <Text style={styles.metaLabel}>Date{"  "}</Text>
              {formatDate(invoiceDate)}
            </Text>
          </View>

          {/* Bill To */}
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Bill To</Text>
            <Text style={styles.metaValue}>{client.name}</Text>
            {clientLines.map((line, i) => (
              <Text key={i} style={styles.metaSubValue}>
                {line}
              </Text>
            ))}
          </View>
        </View>

        {/* ── Line Items Table ── */}
        <View style={styles.table}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.thText, styles.colNum]}>#</Text>
            <Text style={[styles.thText, styles.colDesc]}>Description</Text>
            <Text style={[styles.thText, styles.colQty]}>Qty</Text>
            <Text style={[styles.thText, styles.colRate]}>Rate</Text>
            <Text style={[styles.thText, styles.colAmount]}>Amount</Text>
          </View>

          {/* Table rows */}
          {lineItems.map((row, idx) => {
            const qty = parseFloat(row.quantity) || 0
            const rate = parseFloat(row.rate) || 0
            const amount = qty * rate
            const isLast = idx === lineItems.length - 1
            return (
              <View
                key={idx}
                style={isLast ? styles.tableRowLast : styles.tableRow}
              >
                <Text style={[styles.tdMuted, styles.colNum]}>{idx + 1}</Text>
                <Text style={[styles.tdText, styles.colDesc]}>
                  {row.description || "—"}
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
        </View>

        {/* ── Totals ── */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{fmt(subtotal)}</Text>
          </View>

          {cgstRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>CGST @ {cgstRate}%</Text>
              <Text style={styles.totalValue}>{fmt(cgstAmt)}</Text>
            </View>
          )}

          {sgstRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>SGST @ {sgstRate}%</Text>
              <Text style={styles.totalValue}>{fmt(sgstAmt)}</Text>
            </View>
          )}

          <View style={styles.dividerRow} />

          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{fmt(grandTotal)}</Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            This is a computer-generated invoice.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
