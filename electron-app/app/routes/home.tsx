import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { ArrowRightIcon, PlusIcon, ReceiptTextIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"

// ─── Types ────────────────────────────────────────────────────────────────────

type Company = { id: string; name: string }
type Client = { id: string; name: string }

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

type InvoiceRow = {
  id: string
  company_id: string
  client_id: string
  invoice_number: string
  invoice_date: string
  billed_items: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function grandTotal(billedItemsJson: string): number {
  try {
    const parsed = JSON.parse(billedItemsJson) as BilledItems
    const subtotal = parsed.items.reduce((s, i) => s + i.amount, 0)
    const cgst = subtotal * ((parsed.cgst_percentage ?? 0) / 100)
    const sgst = subtotal * ((parsed.sgst_percentage ?? 0) / 100)
    return Math.ceil(subtotal + cgst + sgst)
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

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate()

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: () => window.electronAPI.companies.getAll(),
  })

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: () => window.electronAPI.clients.getAll(),
  })

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", 1, 5],
    queryFn: () =>
      window.electronAPI.invoices.getPaginated({ page: 1, pageSize: 5 }),
  })

  const invoices = (data?.invoices ?? []) as InvoiceRow[]

  const companyMap = React.useMemo(
    () => Object.fromEntries(companies.map((c) => [c.id, c.name])),
    [companies]
  )
  const clientMap = React.useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c.name])),
    [clients]
  )

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold">Recent Invoices</h1>
        <Button onClick={() => navigate("/invoices/new")}>
          <PlusIcon />
          New Invoice
        </Button>
      </div>

      {/* ── Table ── */}
      {isLoading ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Client</TableHead>
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
            <EmptyTitle>No Invoices Yet</EmptyTitle>
            <EmptyDescription>
              Create your first invoice to get started.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => navigate("/invoices/new")}>
              <PlusIcon />
              New Invoice
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Total (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} className="group cursor-pointer" onClick={() => navigate(`/invoices/${inv.id}`)}>
                  <TableCell className="font-medium">
                    {inv.invoice_number}
                  </TableCell>
                  <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                  <TableCell>{companyMap[inv.company_id] ?? "—"}</TableCell>
                  <TableCell>{clientMap[inv.client_id] ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(grandTotal(inv.billed_items))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Footer ── */}
      {invoices.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/invoices")}
          >
            View all invoices
            <ArrowRightIcon />
          </Button>
        </div>
      )}
    </div>
  )
}
