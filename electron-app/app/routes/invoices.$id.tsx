import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router"
import {
  ArrowLeftIcon,
  BuildingIcon,
  CalendarIcon,
  DownloadIcon,
  EyeIcon,
  PlusIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react"
import { pdf } from "@react-pdf/renderer"
import type { InvoicePDFProps } from "@/components/invoice-pdf"
import { InvoicePDFDocument } from "@/components/invoice-pdf"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

// ─── Types ────────────────────────────────────────────────────────────────────

type Company = {
  id: string
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

type Client = {
  id: string
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

type BilledItems = {
  items: {
    description: string
    quantity: number
    rate: number
    amount: number
  }[]
  cgst_percentage: number
  sgst_percentage: number
}

// ─── IPC helpers ─────────────────────────────────────────────────────────────

function companyFromRow(
  r: Awaited<ReturnType<typeof window.electronAPI.companies.getAll>>[number]
): Company {
  return {
    id: r.id,
    name: r.name,
    emailPrimary: r.email_primary,
    emailSecondary: r.email_secondary,
    phonePrimary: r.phone_primary,
    phoneSecondary: r.phone_secondary,
    phoneLandline: r.phone_landline,
    website: r.website,
    pan: r.pan,
    gstin: r.gstin,
    address: r.address,
    state: r.state,
  }
}

function clientFromRow(
  r: Awaited<ReturnType<typeof window.electronAPI.clients.getAll>>[number]
): Client {
  return {
    id: r.id,
    name: r.name,
    emailPrimary: r.email_primary,
    emailSecondary: r.email_secondary,
    phonePrimary: r.phone_primary,
    phoneSecondary: r.phone_secondary,
    phoneLandline: r.phone_landline,
    gstin: r.gstin,
    address: r.address,
    state: r.state,
  }
}

async function fetchCompanies(): Promise<Company[]> {
  return (await window.electronAPI.companies.getAll()).map(companyFromRow)
}

async function fetchClients(): Promise<Client[]> {
  return (await window.electronAPI.clients.getAll()).map(clientFromRow)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-sm font-medium text-foreground">{children}</p>
  )
}

function DetailBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="font-medium text-foreground/70">{label}:</span>
      <span>{value}</span>
    </div>
  )
}

function EntityDetails({
  icon: Icon,
  entity,
}: {
  icon: React.ElementType
  entity: Company | Client
}) {
  const rows = [
    { label: "GSTIN", value: entity.gstin },
    { label: "PAN", value: (entity as Company).pan },
    { label: "Email", value: entity.emailPrimary },
    { label: "Email 2", value: entity.emailSecondary },
    { label: "Phone", value: entity.phonePrimary },
    { label: "Phone 2", value: entity.phoneSecondary },
    { label: "Landline", value: entity.phoneLandline },
    { label: "Website", value: (entity as Company).website },
    { label: "Address", value: entity.address },
    { label: "State", value: entity.state },
  ].filter((r) => r.value)

  return (
    <div className="mt-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2.5">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-medium">{entity.name}</span>
      </div>
      <div className="flex flex-col gap-1">
        {rows.map((r) => (
          <DetailBadge key={r.label} label={r.label} value={r.value} />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditInvoice() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // ── Data queries ──
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  })

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  const {
    data: invoice,
    isLoading: invoiceLoading,
    isError: invoiceError,
  } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => window.electronAPI.invoices.getById(id!),
    enabled: !!id,
  })

  // ── Form state ──
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<
    string | null
  >(null)
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(
    null
  )
  const [invoiceNumber, setInvoiceNumber] = React.useState("")
  const [invoiceDate, setInvoiceDate] = React.useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = React.useState(false)

  type LineItem = {
    id: string
    description: string
    quantity: string
    rate: string
  }
  const [lineItems, setLineItems] = React.useState<LineItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: "", rate: "" },
  ])
  const [cgstPct, setCgstPct] = React.useState("")
  const [sgstPct, setSgstPct] = React.useState("")

  // ── Seed form from loaded invoice ──
  const [seeded, setSeeded] = React.useState(false)
  React.useEffect(() => {
    if (!invoice || seeded) return
    setSelectedCompanyId(invoice.company_id)
    setSelectedClientId(invoice.client_id)
    setInvoiceNumber(invoice.invoice_number)
    if (invoice.invoice_date) {
      const [y, m, d] = invoice.invoice_date.split("-").map(Number)
      setInvoiceDate(new Date(y, m - 1, d))
    }
    try {
      const parsed = JSON.parse(invoice.billed_items) as BilledItems
      setLineItems(
        parsed.items.map((item) => ({
          id: crypto.randomUUID(),
          description: item.description,
          quantity: String(item.quantity),
          rate: String(item.rate),
        }))
      )
      setCgstPct(
        parsed.cgst_percentage > 0 ? String(parsed.cgst_percentage) : ""
      )
      setSgstPct(
        parsed.sgst_percentage > 0 ? String(parsed.sgst_percentage) : ""
      )
    } catch {
      // leave defaults
    }
    setSeeded(true)
  }, [invoice, seeded])

  // ── Derived ──
  const subtotal = lineItems.reduce(
    (sum, r) => sum + (parseFloat(r.quantity) || 0) * (parseFloat(r.rate) || 0),
    0
  )
  const cgstAmt = subtotal * ((parseFloat(cgstPct) || 0) / 100)
  const sgstAmt = subtotal * ((parseFloat(sgstPct) || 0) / 100)
  const exactTotal = subtotal + cgstAmt + sgstAmt
  const grandTotal = Math.ceil(exactTotal)
  const roundedOff = grandTotal - exactTotal

  const selectedCompany = React.useMemo(
    () => companies.find((c) => c.id === selectedCompanyId),
    [companies, selectedCompanyId]
  )
  const selectedClient = React.useMemo(
    () => clients.find((c) => c.id === selectedClientId),
    [clients, selectedClientId]
  )

  // ── Line item helpers ──
  function addRow() {
    setLineItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: "", quantity: "", rate: "" },
    ])
  }

  function removeRow(rowId: string) {
    setLineItems((prev) => prev.filter((r) => r.id !== rowId))
  }

  function updateRow(
    rowId: string,
    field: keyof Omit<LineItem, "id">,
    value: string
  ) {
    setLineItems((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    )
  }

  // ── Actions ──
  const queryClient = useQueryClient()
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [downloading, setDownloading] = React.useState(false)
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null)
  const [pdfOpen, setPdfOpen] = React.useState(false)

  React.useEffect(() => {
    if (!pdfOpen && pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    }
  }, [pdfOpen])

  async function handleUpdate() {
    if (!selectedCompanyId) {
      toast.error("Please select a company.")
      return
    }
    if (!selectedClientId) {
      toast.error("Please select a client.")
      return
    }
    if (!invoiceNumber.trim()) {
      toast.error("Invoice number is required.")
      return
    }

    setSaving(true)
    try {
      const billedItems = JSON.stringify({
        items: lineItems.map((r) => ({
          description: r.description,
          quantity: parseFloat(r.quantity) || 0,
          rate: parseFloat(r.rate) || 0,
          amount: (parseFloat(r.quantity) || 0) * (parseFloat(r.rate) || 0),
        })),
        cgst_percentage: parseFloat(cgstPct) || 0,
        sgst_percentage: parseFloat(sgstPct) || 0,
      })

      const pad = (n: number) => String(n).padStart(2, "0")
      const localDate = `${invoiceDate.getFullYear()}-${pad(invoiceDate.getMonth() + 1)}-${pad(invoiceDate.getDate())}`

      await window.electronAPI.invoices.update({
        id: id!,
        company_id: selectedCompanyId,
        client_id: selectedClientId,
        invoice_number: invoiceNumber.trim(),
        invoice_date: localDate,
        billed_items: billedItems,
      })

      await queryClient.invalidateQueries({ queryKey: ["invoices"] })
      await queryClient.invalidateQueries({ queryKey: ["invoice", id] })
      toast.success("Invoice updated.")
      void navigate("/invoices")
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update invoice."
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleViewPdf() {
    if (!selectedCompany || !selectedClient) {
      toast.error("Please select a company and client before viewing.")
      return
    }
    try {
      const props: InvoicePDFProps = {
        company: selectedCompany,
        client: selectedClient,
        invoiceNumber,
        invoiceDate,
        lineItems,
        cgstPct,
        sgstPct,
      }
      const blob = await pdf(<InvoicePDFDocument {...props} />).toBlob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setPdfOpen(true)
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate PDF preview."
      )
    }
  }

  async function handleDownload() {
    if (!selectedCompany || !selectedClient) {
      toast.error("Please select a company and client before downloading.")
      return
    }

    setDownloading(true)
    try {
      const props: InvoicePDFProps = {
        company: selectedCompany,
        client: selectedClient,
        invoiceNumber,
        invoiceDate,
        lineItems,
        cgstPct,
        sgstPct,
      }
      const blob = await pdf(<InvoicePDFDocument {...props} />).toBlob()
      const buffer = await blob.arrayBuffer()
      const result = await window.electronAPI.invoices.savePdf({
        defaultName: `${invoiceNumber.replace(/\//g, "-")}.pdf`,
        buffer,
      })
      if (result.success) {
        toast.success("Invoice downloaded.")
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate PDF."
      )
    } finally {
      setDownloading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await window.electronAPI.invoices.delete(id!)
      await queryClient.invalidateQueries({ queryKey: ["invoices"] })
      toast.success("Invoice deleted.")
      void navigate("/invoices")
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete invoice."
      )
      setDeleting(false)
    }
  }

  // ── Loading / error states ──
  const pageLoading = invoiceLoading || companiesLoading || clientsLoading

  if (pageLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <Skeleton className="mt-10 h-40 w-full" />
      </div>
    )
  }

  if (!invoice || invoiceError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2"
          onClick={() => navigate("/invoices")}
        >
          <ArrowLeftIcon className="mr-1.5 size-3.5" />
          Back to Invoices
        </Button>
        <p className="text-sm text-muted-foreground">Invoice not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* ── Header ── */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => navigate("/invoices")}
          >
            <ArrowLeftIcon className="mr-1.5 size-3.5" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {invoice.invoice_number}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewPdf}
            disabled={downloading || saving || deleting}
          >
            <EyeIcon className="mr-1.5 size-3.5" />
            View as PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={downloading || saving || deleting}
          >
            <DownloadIcon className="mr-1.5 size-3.5" />
            {downloading ? "Preparing…" : "Download Invoice"}
          </Button>

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="destructive" size="sm" disabled={deleting} />
              }
            >
              <Trash2Icon className="mr-1.5 size-3.5" />
              Delete Invoice
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete invoice{" "}
                  <strong>{invoice.invoice_number}</strong>. This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* ── Company + Client / Number + Date grid ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Grid 1: Company + Client */}
        <div className="flex flex-col gap-6">
          {/* Company */}
          <div>
            <FieldLabel>My Company</FieldLabel>
            <Combobox
              value={selectedCompanyId}
              onValueChange={(val) =>
                setSelectedCompanyId(val as string | null)
              }
              items={companies.map((c) => c.id)}
              itemToStringLabel={(id) =>
                companies.find((c) => c.id === id)?.name ?? ""
              }
            >
              <ComboboxInput
                className="w-full"
                placeholder="Search company…"
                showClear={!!selectedCompanyId}
              />
              <ComboboxContent>
                <ComboboxList>
                  <ComboboxEmpty>No companies found.</ComboboxEmpty>
                  {companies.map((company) => (
                    <ComboboxItem key={company.id} value={company.id}>
                      <span className="font-medium">{company.name}</span>
                      {company.gstin && (
                        <span className="ml-1 text-muted-foreground">
                          ({company.gstin})
                        </span>
                      )}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {selectedCompany && (
              <EntityDetails icon={BuildingIcon} entity={selectedCompany} />
            )}
          </div>

          {/* Client */}
          <div>
            <FieldLabel>Client</FieldLabel>
            <Combobox
              value={selectedClientId}
              onValueChange={(val) => setSelectedClientId(val as string | null)}
              items={clients.map((c) => c.id)}
              itemToStringLabel={(id) =>
                clients.find((c) => c.id === id)?.name ?? ""
              }
            >
              <ComboboxInput
                className="w-full"
                placeholder="Search client…"
                showClear={!!selectedClientId}
              />
              <ComboboxContent>
                <ComboboxList>
                  <ComboboxEmpty>No clients found.</ComboboxEmpty>
                  {clients.map((client) => (
                    <ComboboxItem key={client.id} value={client.id}>
                      <span className="font-medium">{client.name}</span>
                      {client.gstin && (
                        <span className="ml-1 text-muted-foreground">
                          ({client.gstin})
                        </span>
                      )}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {selectedClient && (
              <EntityDetails icon={UserIcon} entity={selectedClient} />
            )}
          </div>
        </div>

        {/* Grid 2: Invoice Number + Date */}
        <div className="flex flex-col gap-6">
          {/* Invoice Number */}
          <div>
            <FieldLabel>Invoice Number</FieldLabel>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="font-mono"
            />
          </div>

          {/* Invoice Date */}
          <div>
            <FieldLabel>Invoice Date</FieldLabel>
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setCalendarOpen((o) => !o)}
              >
                <CalendarIcon className="mr-2 size-4 text-muted-foreground" />
                {invoiceDate.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Button>
              {calendarOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border border-border bg-popover shadow-md">
                  <Calendar
                    mode="single"
                    selected={invoiceDate}
                    onSelect={(date) => {
                      if (date) setInvoiceDate(date)
                      setCalendarOpen(false)
                    }}
                    defaultMonth={invoiceDate}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Line Items ── */}
      <div className="mt-10">
        <h2 className="mb-3 text-base font-semibold">Billed Items</h2>

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
                <th className="w-12 px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Description</th>
                <th className="w-28 px-3 py-2.5">Quantity</th>
                <th className="w-28 px-3 py-2.5">Rate</th>
                <th className="w-32 px-3 py-2.5">Amount</th>
                <th className="w-10 px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {lineItems.map((row, idx) => {
                const qty = parseFloat(row.quantity) || 0
                const rate = parseFloat(row.rate) || 0
                const amount = qty * rate
                return (
                  <tr
                    key={row.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-3 py-1.5 text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-1.5">
                      <Input
                        value={row.description}
                        onChange={(e) =>
                          updateRow(row.id, "description", e.target.value)
                        }
                        placeholder="Item description"
                        className="h-8 border border-transparent bg-transparent shadow-none hover:border-border focus:border-border focus:bg-input/20 focus-visible:ring-0 dark:bg-transparent dark:focus:bg-input/30"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <Input
                        type="number"
                        value={row.quantity}
                        onChange={(e) =>
                          updateRow(row.id, "quantity", e.target.value)
                        }
                        placeholder="0"
                        className="h-8 border border-transparent bg-transparent shadow-none hover:border-border focus:border-border focus:bg-input/20 focus-visible:ring-0 dark:bg-transparent dark:focus:bg-input/30"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <Input
                        type="number"
                        value={row.rate}
                        onChange={(e) =>
                          updateRow(row.id, "rate", e.target.value)
                        }
                        placeholder="0.00"
                        className="h-8 border border-transparent bg-transparent shadow-none hover:border-border focus:border-border focus:bg-input/20 focus-visible:ring-0 dark:bg-transparent dark:focus:bg-input/30"
                      />
                    </td>
                    <td className="px-3 py-1.5 font-mono text-sm">
                      {amount > 0
                        ? amount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "—"}
                    </td>
                    <td className="px-3 py-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeRow(row.id)}
                        disabled={lineItems.length === 1}
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Add row */}
        <Button
          variant="ghost"
          onClick={addRow}
          className="group mt-0 w-full rounded-t-none rounded-b-md border border-dashed border-border/60 py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-muted/30"
        >
          <span className="flex items-center justify-center gap-1.5 group-hover:text-primary">
            <PlusIcon className="size-3.5" />
            Add row
          </span>
        </Button>

        {/* Tax summary */}
        <div className="mt-4 flex flex-col items-end gap-1.5">
          {/* CGST */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">CGST @</span>
            <Input
              type="number"
              min="0"
              value={cgstPct}
              onChange={(e) =>
                setCgstPct(
                  Math.max(0, parseFloat(e.target.value) || 0).toString()
                )
              }
              placeholder="0"
              className="h-7 w-16 text-center"
            />
            <span className="text-muted-foreground">%</span>
            <span className="w-32 text-right font-mono text-sm">
              {cgstAmt.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* SGST */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">SGST @</span>
            <Input
              type="number"
              min="0"
              value={sgstPct}
              onChange={(e) =>
                setSgstPct(
                  Math.max(0, parseFloat(e.target.value) || 0).toString()
                )
              }
              placeholder="0"
              className="h-7 w-16 text-center"
            />
            <span className="text-muted-foreground">%</span>
            <span className="w-32 text-right font-mono text-sm">
              {sgstAmt.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Rounded off */}
          {Math.abs(roundedOff) >= 0.005 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-32 text-right">Rounded Off</span>
              <span className="w-32 text-right font-mono">
                {roundedOff.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          <Separator className="w-64" />

          {/* Grand total */}
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span>Total</span>
            <span className="w-32 text-right font-mono">
              {grandTotal.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Update button ── */}
      <div className="mt-8 flex justify-end">
        <Button onClick={handleUpdate} disabled={saving}>
          {saving ? "Saving…" : "Update Invoice"}
        </Button>
      </div>

      {/* ── PDF Preview Dialog ── */}
      <Dialog open={pdfOpen} onOpenChange={setPdfOpen}>
        <DialogContent
          className="w-[95vw] max-w-[95vw] sm:max-w-[95vw] h-[95vh] flex flex-col gap-3"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>{invoiceNumber}</DialogTitle>
          </DialogHeader>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full flex-1 rounded border-0"
              title="Invoice PDF Preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
