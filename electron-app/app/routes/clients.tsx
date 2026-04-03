import * as React from "react"
import {
  MailIcon,
  MapPinIcon,
  PhoneCallIcon,
  PhoneIcon,
  PlusIcon,
  ReceiptTextIcon,
  Users,
} from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
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

const EMPTY_FORM: Omit<Client, "id"> = {
  name: "",
  emailPrimary: "",
  emailSecondary: "",
  phonePrimary: "",
  phoneSecondary: "",
  phoneLandline: "",
  gstin: "",
  address: "",
  state: "",
}

// ─── IPC helpers ─────────────────────────────────────────────────────────────

function toRow(c: Client) {
  return {
    id: c.id,
    name: c.name,
    email_primary: c.emailPrimary,
    email_secondary: c.emailSecondary,
    phone_primary: c.phonePrimary,
    phone_secondary: c.phoneSecondary,
    phone_landline: c.phoneLandline,
    gstin: c.gstin,
    address: c.address,
    state: c.state,
  }
}

function fromRow(
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

async function fetchClients(): Promise<Client[]> {
  const rows = await window.electronAPI.clients.getAll()
  return rows.map(fromRow)
}

async function createClient(data: Omit<Client, "id">): Promise<Client> {
  const id = crypto.randomUUID()
  const row = await window.electronAPI.clients.create({ ...toRow({ id, ...data }), id })
  return fromRow(row)
}

async function updateClient(data: Client): Promise<Client> {
  const row = await window.electronAPI.clients.update(toRow(data))
  return fromRow(row)
}

async function deleteClient(id: string): Promise<void> {
  await window.electronAPI.clients.delete(id)
}

// ─── CardRow ─────────────────────────────────────────────────────────────────

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

// ─── ClientCard ──────────────────────────────────────────────────────────────

function ClientCard({
  client,
  onEdit,
  onDelete,
}: {
  client: Client
  onEdit: (client: Client) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{client.name}</CardTitle>
        <CardDescription>{client.emailPrimary}</CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="flex flex-col gap-2.5">
          <CardRow icon={MailIcon} value={client.emailPrimary} />
          <CardRow icon={MailIcon} value={client.emailSecondary} tag="(S)" />
          <CardRow icon={PhoneIcon} value={client.phonePrimary} />
          <CardRow icon={PhoneIcon} value={client.phoneSecondary} tag="(S)" />
          <CardRow icon={PhoneCallIcon} value={client.phoneLandline} />
          <CardRow icon={MapPinIcon} value={client.state} />
          <CardRow icon={MapPinIcon} value={client.address} tag="Addr" />
          <CardRow icon={ReceiptTextIcon} value={client.gstin} mono />
        </ul>
      </CardContent>

      <CardFooter className="mt-auto gap-2 border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(client)}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          onClick={() => onDelete(client.id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Clients() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingClient, setEditingClient] = React.useState<Client | null>(null)
  const [form, setForm] = React.useState<Omit<Client, "id">>(EMPTY_FORM)

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      setForm(EMPTY_FORM)
      setDialogOpen(false)
      toast.success("Client created")
    },
    onError: () => {
      toast.error("Failed to create client")
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      setForm(EMPTY_FORM)
      setEditingClient(null)
      setDialogOpen(false)
      toast.success("Client updated")
    },
    onError: () => {
      toast.error("Failed to update client")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      toast.success("Client deleted")
    },
    onError: () => {
      toast.error("Failed to delete client")
    },
  })

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingClient) {
      updateMutation.mutate({ ...form, id: editingClient.id })
    } else {
      createMutation.mutate(form)
    }
  }

  function handleEdit(client: Client) {
    setEditingClient(client)
    setForm({
      name: client.name,
      emailPrimary: client.emailPrimary,
      emailSecondary: client.emailSecondary,
      phonePrimary: client.phonePrimary,
      phoneSecondary: client.phoneSecondary,
      phoneLandline: client.phoneLandline,
      gstin: client.gstin,
      address: client.address,
      state: client.state,
    })
    setDialogOpen(true)
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id)
  }

  function handleDialogChange(open: boolean) {
    if (!open) {
      setForm(EMPTY_FORM)
      setEditingClient(null)
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
              {editingClient ? "Edit Client" : "Create Client"}
            </DialogTitle>
            <DialogDescription>
              {editingClient
                ? "Update the details for this client."
                : "Add a new client to your list."}
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
                  placeholder="hello@client.com"
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
                  placeholder="accounts@client.com"
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
                  : editingClient
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
          <h1 className="text-sm font-semibold">Clients</h1>
          {clients.length > 0 && (
            <span className="inline-flex h-5 items-center rounded-full bg-muted px-2 text-xs text-muted-foreground">
              {clients.length}
            </span>
          )}
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <PlusIcon />
          Create Client
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
              </CardContent>
              <CardFooter className="mt-auto gap-2 border-t pt-3">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <Empty className="flex-1 border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>No Clients Yet</EmptyTitle>
            <EmptyDescription>
              Add your first client to start creating invoices.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setDialogOpen(true)}>
              <PlusIcon />
              Create Client
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
