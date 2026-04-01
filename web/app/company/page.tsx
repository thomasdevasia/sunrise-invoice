"use client"

import * as React from "react"
import {
  BadgeIcon,
  Building2,
  ExternalLinkIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PhoneCallIcon,
  PhoneIcon,
  PlusIcon,
  ReceiptTextIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createCompanyAction,
  deleteCompanyAction,
  getCompaniesAction,
  updateCompanyAction,
  type CompanyResponse,
} from "./actions"

// ─── Types ────────────────────────────────────────────────────────────────────

type Company = CompanyResponse

const EMPTY_FORM: Omit<Company, "id"> = {
  name: "",
  emailPrimary: "",
  emailSecondary: "",
  phonePrimary: "",
  phoneSecondary: "",
  phoneLandline: "",
  website: "",
  pan: "",
  gstin: "",
  address: "",
  state: "",
}

// ─── CompanyCard ──────────────────────────────────────────────────────────────

function CardRow({
  icon: Icon,
  value,
  mono = false,
  tag,
}: {
  icon: React.ElementType
  value: string
  mono?: boolean
  tag?: string
}) {
  if (!value) return null
  return (
    <li className="flex items-start gap-2">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      {tag && (
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {tag}
        </span>
      )}
      <span className={mono ? "font-mono tracking-wide" : ""}>{value}</span>
    </li>
  )
}

function CompanyCard({
  company,
  onEdit,
  onDelete,
}: {
  company: Company
  onEdit: (company: Company) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{company.name}</CardTitle>
        <CardDescription>{company.emailPrimary}</CardDescription>
        {company.website && (
          <CardAction>
            <a href={company.website} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon-sm">
                <ExternalLinkIcon />
                <span className="sr-only">Visit website</span>
              </Button>
            </a>
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        <ul className="flex flex-col gap-2.5">
          {/* Emails */}
          <CardRow icon={MailIcon} value={company.emailPrimary} />
          <CardRow icon={MailIcon} value={company.emailSecondary} tag="(S)" />
          {/* Phones */}
          <CardRow icon={PhoneIcon} value={company.phonePrimary} />
          <CardRow icon={PhoneIcon} value={company.phoneSecondary} tag="(S)" />
          <CardRow icon={PhoneCallIcon} value={company.phoneLandline} />
          {/* Location */}
          <CardRow icon={MapPinIcon} value={company.state} />
          <CardRow icon={MapPinIcon} value={company.address} tag="Addr" />
          {/* Website */}
          <CardRow icon={GlobeIcon} value={company.website} />
          {/* Tax */}
          <CardRow icon={BadgeIcon} value={company.pan} mono />
          <CardRow icon={ReceiptTextIcon} value={company.gstin} mono />
        </ul>
      </CardContent>

      <CardFooter className="mt-auto gap-2 border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(company)}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          onClick={() => onDelete(company.id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompanyPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(
    null
  )
  const [form, setForm] = React.useState(EMPTY_FORM)

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getCompaniesAction(),
  })

  const createMutation = useMutation({
    mutationFn: createCompanyAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      setForm(EMPTY_FORM)
      setDialogOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateCompanyAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      setForm(EMPTY_FORM)
      setEditingCompany(null)
      setDialogOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCompanyAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
    },
  })

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (editingCompany) {
      updateMutation.mutate({ ...form, id: editingCompany.id })
    } else {
      createMutation.mutate(form)
    }
  }

  function handleEdit(company: Company) {
    setEditingCompany(company)
    setForm({
      name: company.name,
      emailPrimary: company.emailPrimary,
      emailSecondary: company.emailSecondary,
      phonePrimary: company.phonePrimary,
      phoneSecondary: company.phoneSecondary,
      phoneLandline: company.phoneLandline,
      website: company.website,
      pan: company.pan,
      gstin: company.gstin,
      address: company.address,
      state: company.state,
    })
    setDialogOpen(true)
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id)
  }

  function handleDialogClose(open: boolean) {
    if (!open) {
      setForm(EMPTY_FORM)
      setEditingCompany(null)
    }
    setDialogOpen(open)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Create Company Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? "Edit Company" : "Create Company"}
            </DialogTitle>
            <DialogDescription>
              {editingCompany
                ? "Update the details for this company."
                : "Add a new business to your companies list."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCreate}
            className="mt-1 flex flex-col gap-4 overflow-y-auto"
          >
            {/* ── General ── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 grid gap-1.5">
                <label htmlFor="name" className="text-xs font-medium">
                  Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Acme Corp"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="col-span-2 grid gap-1.5">
                <label htmlFor="state" className="text-xs font-medium">
                  State <span className="text-destructive">*</span>
                </label>
                <Input
                  id="state"
                  name="state"
                  placeholder="Karnataka"
                  value={form.state}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="col-span-2 grid gap-1.5">
                <label htmlFor="address" className="text-xs font-medium">
                  Address <span className="text-destructive">*</span>
                </label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main St, Bangalore"
                  value={form.address}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            {/* ── Email ── */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">Email</p>
              <div className="grid gap-1.5">
                <label htmlFor="emailPrimary" className="text-xs">
                  Primary <span className="text-destructive">*</span>
                </label>
                <Input
                  id="emailPrimary"
                  name="emailPrimary"
                  type="email"
                  placeholder="hello@company.com"
                  value={form.emailPrimary}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <label
                  htmlFor="emailSecondary"
                  className="text-xs text-muted-foreground"
                >
                  Secondary
                </label>
                <Input
                  id="emailSecondary"
                  name="emailSecondary"
                  type="email"
                  placeholder="accounts@company.com"
                  value={form.emailSecondary}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            {/* ── Phone ── */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">Phone</p>
              <div className="grid gap-1.5">
                <label htmlFor="phonePrimary" className="text-xs">
                  Primary <span className="text-destructive">*</span>
                </label>
                <Input
                  id="phonePrimary"
                  name="phonePrimary"
                  placeholder="+91 98765 43210"
                  value={form.phonePrimary}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <label
                  htmlFor="phoneSecondary"
                  className="text-xs text-muted-foreground"
                >
                  Secondary
                </label>
                <Input
                  id="phoneSecondary"
                  name="phoneSecondary"
                  placeholder="+91 91234 56789"
                  value={form.phoneSecondary}
                  onChange={handleFormChange}
                />
              </div>
              <div className="grid gap-1.5">
                <label
                  htmlFor="phoneLandline"
                  className="text-xs text-muted-foreground"
                >
                  Landline
                </label>
                <Input
                  id="phoneLandline"
                  name="phoneLandline"
                  placeholder="080-41234567"
                  value={form.phoneLandline}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            {/* ── Tax ── */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">Tax</p>
              <div className="grid gap-1.5">
                <label htmlFor="pan" className="text-xs">
                  PAN <span className="text-destructive">*</span>
                </label>
                <Input
                  id="pan"
                  name="pan"
                  placeholder="AAAAA0000A"
                  value={form.pan}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="gstin" className="text-xs">
                  GSTIN / UIN <span className="text-destructive">*</span>
                </label>
                <Input
                  id="gstin"
                  name="gstin"
                  placeholder="22AAAAA0000A1Z5"
                  value={form.gstin}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            {/* ── Other ── */}
            <div className="grid gap-1.5">
              <label
                htmlFor="website"
                className="text-xs font-medium text-muted-foreground"
              >
                Website
              </label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://company.com"
                value={form.website}
                onChange={handleFormChange}
              />
            </div>

            <DialogFooter className="mt-2">
              <DialogClose render={<Button variant="outline" type="button" />}>
                Cancel
              </DialogClose>
              <Button type="submit">
                {editingCompany ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold">My Companies</h1>
          {companies.length > 0 && (
            <span className="inline-flex h-5 items-center rounded-full bg-muted px-2 text-xs text-muted-foreground">
              {companies.length}
            </span>
          )}
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <PlusIcon />
          Create Company
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-44" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
              <CardFooter className="mt-auto gap-2 border-t pt-3">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <Empty className="flex-1 border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 />
            </EmptyMedia>
            <EmptyTitle>No Companies Yet</EmptyTitle>
            <EmptyDescription>
              Add your first business to start creating invoices.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setDialogOpen(true)}>
              <PlusIcon />
              Create Company
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
