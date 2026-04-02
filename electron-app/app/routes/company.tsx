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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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

// ─── IPC helpers ─────────────────────────────────────────────────────────────

function toRow(c: Company) {
  return {
    id: c.id,
    name: c.name,
    email_primary: c.emailPrimary,
    email_secondary: c.emailSecondary,
    phone_primary: c.phonePrimary,
    phone_secondary: c.phoneSecondary,
    phone_landline: c.phoneLandline,
    website: c.website,
    pan: c.pan,
    gstin: c.gstin,
    address: c.address,
    state: c.state,
  }
}

function fromRow(
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

async function fetchCompanies(): Promise<Company[]> {
  const rows = await window.electronAPI.companies.getAll()
  return rows.map(fromRow)
}

async function createCompany(data: Omit<Company, "id">): Promise<Company> {
  const id = crypto.randomUUID()
  console.log("Creating company with ID:", id, "and data:", data)
  const row = await window.electronAPI.companies.create({
    ...toRow({ id, ...data }),
    id,
  })
  return fromRow(row)
}

async function updateCompany(data: Company): Promise<Company> {
  const row = await window.electronAPI.companies.update(toRow(data))
  return fromRow(row)
}

async function deleteCompany(id: string): Promise<void> {
  await window.electronAPI.companies.delete(id)
}

// ─── CardRow ──────────────────────────────────────────────────────────────────

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

// ─── CompanyCard ──────────────────────────────────────────────────────────────

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
          <CardRow icon={MailIcon} value={company.emailPrimary} />
          <CardRow icon={MailIcon} value={company.emailSecondary} tag="(S)" />
          <CardRow icon={PhoneIcon} value={company.phonePrimary} />
          <CardRow icon={PhoneIcon} value={company.phoneSecondary} tag="(S)" />
          <CardRow icon={PhoneCallIcon} value={company.phoneLandline} />
          <CardRow icon={MapPinIcon} value={company.state} />
          <CardRow icon={MapPinIcon} value={company.address} tag="Addr" />
          <CardRow icon={GlobeIcon} value={company.website} />
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

export default function Company() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(
    null
  )
  const [form, setForm] = React.useState<Omit<Company, "id">>(EMPTY_FORM)

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  })

  const createMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      setForm(EMPTY_FORM)
      setDialogOpen(false)
      toast.success("Company created")
    },
    onError: () => {
      toast.error("Failed to create company")
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      setForm(EMPTY_FORM)
      setEditingCompany(null)
      setDialogOpen(false)
      toast.success("Company updated")
    },
    onError: () => {
      toast.error("Failed to update company")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      toast.success("Company deleted")
    },
    onError: () => {
      toast.error("Failed to delete company")
    },
  })

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log("Submitting form with data:", form)
    if (editingCompany) {
      updateMutation.mutate({ ...form, id: editingCompany.id })
      console.log(
        "Triggered update mutation for company ID:",
        editingCompany.id
      )
    } else {
      createMutation.mutate(form)
      console.log("Triggered create mutation with form data:", form)
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

  function handleDialogChange(open: boolean) {
    if (!open) {
      setForm(EMPTY_FORM)
      setEditingCompany(null)
    }
    setDialogOpen(open)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
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
            onSubmit={handleSubmit}
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
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving…"
                  : editingCompany
                    ? "Save Changes"
                    : "Create"}
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
