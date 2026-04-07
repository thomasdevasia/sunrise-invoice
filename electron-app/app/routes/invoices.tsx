import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import {
  PlusIcon,
  ReceiptTextIcon,
  SearchIcon,
  XCircleIcon,
} from "lucide-react"

import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─── Types ────────────────────────────────────────────────────────────────────

type Company = { id: string; name: string; gstin: string }

type BilledItems = {
  items: {
    description: string
    hsn_sac?: string
    quantity: number
    rate: number
    amount: number
  }[]
  other_charges?: {
    description: string
    amount: number
  }[]
  cgst_percentage: number
  sgst_percentage: number
  igst_percentage?: number
}

type InvoiceRow = {
  id: string
  company_id: string
  bill_to: string
  ship_to: string
  ship_same_as_bill: number
  invoice_number: string
  invoice_date: string
  billed_items: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function grandTotal(billedItemsJson: string): number {
  try {
    const parsed = JSON.parse(billedItemsJson) as BilledItems
    const subtotal = parsed.items.reduce((s, i) => s + i.amount, 0)
    const otherChargesTotal = (parsed.other_charges ?? []).reduce((s, c) => s + c.amount, 0)
    const taxableAmount = subtotal + otherChargesTotal
    const cgst = taxableAmount * ((parsed.cgst_percentage ?? 0) / 100)
    const sgst = taxableAmount * ((parsed.sgst_percentage ?? 0) / 100)
    const igst = taxableAmount * ((parsed.igst_percentage ?? 0) / 100)
    return Math.ceil(taxableAmount + cgst + sgst + igst)
  } catch {
    return 0
  }
}

function formatDate(iso: string): string {
  if (!iso) return "—"
  try {
    const [y, m, d] = iso.split("-")
    return `${d} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(m, 10) - 1]} ${y}`
  } catch {
    return iso
  }
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function fetchCompanies(): Promise<Company[]> {
  const rows = await window.electronAPI.companies.getAll()
  return rows.map((r) => ({ id: r.id, name: r.name, gstin: r.gstin }))
}

async function fetchInvoices(params: {
  page: number
  companyId?: string
  date?: string
  invoiceNumber?: string
}) {
  return window.electronAPI.invoices.getPaginated({
    page: params.page,
    pageSize: PAGE_SIZE,
    companyId: params.companyId || undefined,
    date: params.date || undefined,
    invoiceNumber: params.invoiceNumber || undefined,
  })
}

const PAGE_SIZE = 10

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-36" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-4 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

// ─── Pagination builder ───────────────────────────────────────────────────────

function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "…")[] = []
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, "…", total)
  } else if (current >= total - 3) {
    pages.push(1, "…", total - 4, total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, "…", current - 1, current, current + 1, "…", total)
  }
  return pages
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Invoices() {
  const navigate = useNavigate()

  // ── Filter draft state (what the user is selecting) ──
  const [draftCompanyId, setDraftCompanyId] = React.useState<string | null>(
    null
  )
  const [draftDate, setDraftDate] = React.useState<string>("")
  const [draftInvoiceNumber, setDraftInvoiceNumber] = React.useState<string>("")

  // ── Committed filter state (what the last Search used) ──
  const [committedCompanyId, setCommittedCompanyId] = React.useState<
    string | null
  >(null)
  const [committedDate, setCommittedDate] = React.useState<string>("")
  const [committedInvoiceNumber, setCommittedInvoiceNumber] =
    React.useState<string>("")
  const [page, setPage] = React.useState(1)

  // ── Load companies for combobox ──
  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  })

  // ── Main invoice query ──
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "invoices",
      page,
      committedCompanyId,
      committedDate,
      committedInvoiceNumber,
    ],
    queryFn: () =>
      fetchInvoices({
        page,
        companyId: committedCompanyId ?? undefined,
        date: committedDate || undefined,
        invoiceNumber: committedInvoiceNumber || undefined,
      }),
    placeholderData: (prev) => prev,
  })

  const invoices = data?.invoices ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // ── Lookup maps ──
  const companyMap = React.useMemo(
    () => Object.fromEntries(companies.map((c) => [c.id, c])),
    [companies]
  )

  function handleSearch() {
    setCommittedCompanyId(draftCompanyId)
    setCommittedDate(draftDate)
    setCommittedInvoiceNumber(draftInvoiceNumber)
    setPage(1)
  }

  function handleClear() {
    setDraftCompanyId(null)
    setDraftDate("")
    setDraftInvoiceNumber("")
    setCommittedCompanyId(null)
    setCommittedDate("")
    setCommittedInvoiceNumber("")
    setPage(1)
  }

  const hasActiveFilters = !!(
    committedCompanyId ||
    committedDate ||
    committedInvoiceNumber
  )
  const loading = isLoading || isFetching

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold">Invoices</h1>
          {total > 0 && (
            <span className="inline-flex h-5 items-center rounded-full bg-muted px-2 text-xs text-muted-foreground">
              {total}
            </span>
          )}
        </div>
        <Button onClick={() => navigate("/invoices/new")}>
          <PlusIcon />
          New Invoice
        </Button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-muted/30 p-3">
        {/* Invoice number filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Invoice #
          </label>
          <Input
            type="text"
            value={draftInvoiceNumber}
            onChange={(e) => setDraftInvoiceNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="001/SAS/2026-27"
            className="w-36"
          />
        </div>

        {/* Company combobox */}
        <div className="flex min-w-45 flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Company
          </label>
          <Combobox
            value={draftCompanyId}
            onValueChange={(val) => setDraftCompanyId(val as string | null)}
            items={companies.map((c) => c.id)}
            itemToStringLabel={(id) =>
              companies.find((c) => c.id === id)?.name ?? ""
            }
          >
            <ComboboxInput
              className="w-full"
              placeholder="All companies…"
              showClear={!!draftCompanyId}
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
        </div>

        {/* Date filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Date
          </label>
          <Input
            type="date"
            value={draftDate}
            onChange={(e) => setDraftDate(e.target.value)}
            className="w-40"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={handleSearch} disabled={loading}>
            <SearchIcon />
            Search
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              title="Clear filters"
            >
              <XCircleIcon className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      {isLoading ? (
        // Full skeleton on initial load
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Bill To</TableHead>
                <TableHead className="text-right">Total (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SkeletonRows />
            </TableBody>
          </Table>
        </div>
      ) : invoices.length === 0 ? (
        <Empty className="flex-1 border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptTextIcon />
            </EmptyMedia>
            <EmptyTitle>
              {hasActiveFilters ? "No Matching Invoices" : "No Invoices Yet"}
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "Try adjusting or clearing your filters."
                : "Create your first invoice to get started."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {!hasActiveFilters && (
              <Button onClick={() => navigate("/invoices/new")}>
                <PlusIcon />
                New Invoice
              </Button>
            )}
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClear}>
                <XCircleIcon />
                Clear Filters
              </Button>
            )}
          </EmptyContent>
        </Empty>
      ) : (
        <div
          className={`flex flex-col gap-4 transition-opacity duration-150 ${isFetching ? "opacity-60" : "opacity-100"}`}
        >
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Bill To</TableHead>
                  <TableHead className="text-right">Total (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetching ? (
                  <SkeletonRows />
                ) : (
                  invoices.map((inv: InvoiceRow) => {
                    const company = companyMap[inv.company_id]
                    const billToName = (() => {
                      try {
                        return (JSON.parse(inv.bill_to) as { name: string })
                          .name
                      } catch {
                        return "—"
                      }
                    })()
                    const total = grandTotal(inv.billed_items)
                    return (
                      <TableRow
                        key={inv.id}
                        className="group cursor-pointer"
                        onClick={() => navigate(`/invoices/${inv.id}`)}
                      >
                        <TableCell className="font-mono text-sm font-medium">
                          {inv.invoice_number}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(inv.invoice_date)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {company?.name ?? (
                            <span className="text-muted-foreground italic">
                              Unknown
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{billToName}</TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatCurrency(total)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-disabled={page === 1}
                    className={
                      page === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {buildPageNumbers(page, totalPages).map((p, i) =>
                  p === "…" ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === page}
                        onClick={() => setPage(p as number)}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-disabled={page === totalPages}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  )
}
