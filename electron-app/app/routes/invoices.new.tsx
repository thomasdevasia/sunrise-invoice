import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import {
  BuildingIcon,
  UserIcon,
  CalendarIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

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
  const rows = await window.electronAPI.companies.getAll()
  return rows.map(companyFromRow)
}

async function fetchClients(): Promise<Client[]> {
  const rows = await window.electronAPI.clients.getAll()
  return rows.map(clientFromRow)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFinancialYear(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-indexed
  if (month >= 4) {
    return `${year}-${String(year + 1).slice(-2)}`
  }
  return `${year - 1}-${String(year).slice(-2)}`
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

function buildInvoiceNumber(
  count: number,
  companyName: string,
  fy: string
): string {
  const paddedCount = String(count).padStart(3, "0")
  const initials = getInitials(companyName)
  return `${paddedCount}/${initials}/${fy}`
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

export default function NewInvoice() {
  const fy = React.useMemo(() => getFinancialYear(), [])

  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  })

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

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

  function addRow() {
    setLineItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: "", quantity: "", rate: "" },
    ])
  }

  function removeRow(id: string) {
    setLineItems((prev) => prev.filter((r) => r.id !== id))
  }

  function updateRow(
    id: string,
    field: keyof Omit<LineItem, "id">,
    value: string
  ) {
    setLineItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  const subtotal = lineItems.reduce((sum, r) => {
    return sum + (parseFloat(r.quantity) || 0) * (parseFloat(r.rate) || 0)
  }, 0)

  const [cgstPct, setCgstPct] = React.useState("")
  const [sgstPct, setSgstPct] = React.useState("")

  const cgstAmt = subtotal * ((parseFloat(cgstPct) || 0) / 100)
  const sgstAmt = subtotal * ((parseFloat(sgstPct) || 0) / 100)
  const grandTotal = subtotal + cgstAmt + sgstAmt

  const selectedCompany: Company | undefined = React.useMemo(
    () => companies.find((c) => c.id === selectedCompanyId),
    [companies, selectedCompanyId]
  )

  const selectedClient: Client | undefined = React.useMemo(
    () => clients.find((c) => c.id === selectedClientId),
    [clients, selectedClientId]
  )

  // Auto-generate invoice number when company changes.
  // Uses live count from the DB so the number is always correct.
  React.useEffect(() => {
    if (!selectedCompany) {
      setInvoiceNumber("")
      return
    }
    void window.electronAPI.invoices.getCount().then((count) => {
      setInvoiceNumber(buildInvoiceNumber(count + 1, selectedCompany.name, fy))
    })
  }, [selectedCompany, fy])

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)

  async function handleCreate() {
    if (!selectedCompanyId) {
      setSaveError("Please select a company.")
      return
    }
    if (!selectedClientId) {
      setSaveError("Please select a client.")
      return
    }
    if (!invoiceNumber.trim()) {
      setSaveError("Invoice number is required.")
      return
    }

    setSaveError(null)
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

      await window.electronAPI.invoices.create({
        id: crypto.randomUUID(),
        company_id: selectedCompanyId,
        client_id: selectedClientId,
        invoice_number: invoiceNumber.trim(),
        invoice_date: localDate,
        billed_items: billedItems,
      })

      await queryClient.invalidateQueries({ queryKey: ["invoices"] })
      void navigate("/invoices")
    } catch (err: unknown) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save invoice."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">
        Create Invoice
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* ── Grid 1: Company + Client ── */}
        <div className="flex flex-col gap-6">
          {/* ── Company ── */}
          <div>
            <FieldLabel>My Company</FieldLabel>
            {companiesLoading ? (
              <Skeleton className="h-9 w-full rounded-md" />
            ) : companies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No companies found.{" "}
                <a
                  href="/company"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Add a company first.
                </a>
              </p>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* ── Client ── */}
          <div>
            <FieldLabel>Client</FieldLabel>
            {clientsLoading ? (
              <Skeleton className="h-9 w-full rounded-md" />
            ) : clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No clients found.{" "}
                <a
                  href="/clients"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Add a client first.
                </a>
              </p>
            ) : (
              <>
                <Combobox
                  value={selectedClientId}
                  onValueChange={(val) =>
                    setSelectedClientId(val as string | null)
                  }
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
              </>
            )}
          </div>
        </div>
        {/* ── end Grid 1 ── */}

        {/* ── Grid 2: Invoice Number + Date ── */}
        <div className="flex flex-col gap-6">
          {/* ── Invoice Number ── */}
          <div>
            <FieldLabel>Invoice Number</FieldLabel>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder={
                selectedCompany ? "" : "Select a company to auto-generate"
              }
              className="font-mono"
            />
            {selectedCompany && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Auto-generated · you can edit this
              </p>
            )}
          </div>

          {/* ── Invoice Date ── */}
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
        {/* ── end Grid 2 ── */}
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

        {/* ── Add row ── */}
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

        {/* ── Tax summary ── */}
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
          <div>
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
            <Separator className="my-1" />
          </div>

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

      {/* ── Create Invoice ── */}
      <div className="mt-8 flex flex-col items-end gap-2">
        {saveError && <p className="text-sm text-destructive">{saveError}</p>}
        <Button onClick={handleCreate} disabled={saving}>
          {saving ? "Saving…" : "Create Invoice"}
        </Button>
      </div>
    </div>
  )
}
