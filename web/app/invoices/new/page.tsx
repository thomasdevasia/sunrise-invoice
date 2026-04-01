"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { BuildingIcon, UserIcon, CalendarIcon } from "lucide-react"

import { getCompaniesAction, type CompanyResponse } from "@/app/company/actions"
import { getClientsAction, type ClientResponse } from "@/app/clients/actions"
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

function buildInvoiceNumber(count: number, companyName: string, fy: string): string {
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
  name,
  gstin,
}: {
  icon: React.ElementType
  name: string
  gstin: string
}) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{name}</span>
        {gstin && <DetailBadge label="GSTIN" value={gstin} />}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateInvoicePage() {
  const fy = React.useMemo(() => getFinancialYear(), [])

  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getCompaniesAction(),
  })

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => getClientsAction(),
  })

  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string | null>(null)
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null)
  const [invoiceNumber, setInvoiceNumber] = React.useState("")
  const [invoiceDate, setInvoiceDate] = React.useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = React.useState(false)

  const selectedCompany: CompanyResponse | undefined = React.useMemo(
    () => companies.find((c) => c.id === selectedCompanyId),
    [companies, selectedCompanyId]
  )

  const selectedClient: ClientResponse | undefined = React.useMemo(
    () => clients.find((c) => c.id === selectedClientId),
    [clients, selectedClientId]
  )

  // Auto-generate invoice number when company changes.
  // Count is hardcoded to 1 until the DB layer is added.
  React.useEffect(() => {
    if (selectedCompany) {
      setInvoiceNumber(buildInvoiceNumber(1, selectedCompany.name, fy))
    } else {
      setInvoiceNumber("")
    }
  }, [selectedCompany, fy])

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Create Invoice</h1>

      <div className="flex flex-col gap-6">

        {/* ── Company ── */}
        <div>
          <FieldLabel>My Company</FieldLabel>
          {companiesLoading ? (
            <Skeleton className="h-9 w-full rounded-md" />
          ) : companies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No companies found.{" "}
              <a href="/company" className="underline underline-offset-2 hover:text-foreground">
                Add a company first.
              </a>
            </p>
          ) : (
            <>
              <Combobox
                value={selectedCompanyId}
                onValueChange={(val) => setSelectedCompanyId(val as string | null)}
                items={companies.map((c) => c.id)}
                itemToStringLabel={(id) => companies.find((c) => c.id === id)?.name ?? ""}
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
                <EntityDetails
                  icon={BuildingIcon}
                  name={selectedCompany.name}
                  gstin={selectedCompany.gstin}
                />
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
              <a href="/clients" className="underline underline-offset-2 hover:text-foreground">
                Add a client first.
              </a>
            </p>
          ) : (
            <>
              <Combobox
                value={selectedClientId}
                onValueChange={(val) => setSelectedClientId(val as string | null)}
                items={clients.map((c) => c.id)}
                itemToStringLabel={(id) => clients.find((c) => c.id === id)?.name ?? ""}
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
                <EntityDetails
                  icon={UserIcon}
                  name={selectedClient.name}
                  gstin={selectedClient.gstin}
                />
              )}
            </>
          )}
        </div>

        {/* ── Invoice Number ── */}
        <div>
          <FieldLabel>Invoice Number</FieldLabel>
          <Input
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder={selectedCompany ? "" : "Select a company to auto-generate"}
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
    </div>
  )
}
