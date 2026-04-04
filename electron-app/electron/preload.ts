import { contextBridge, ipcRenderer } from "electron"

export type CompanyData = {
    id: string
    name: string
    email_primary: string
    email_secondary: string
    phone_primary: string
    phone_secondary: string
    phone_landline: string
    website: string
    pan: string
    gstin: string
    address: string
    state: string
}

export type CreateCompanyData = Omit<CompanyData, "id">

const companiesAPI = {
    getAll: (): Promise<CompanyData[]> =>
        ipcRenderer.invoke("companies:getAll"),
    create: (data: CreateCompanyData & { id: string }): Promise<CompanyData> =>
        ipcRenderer.invoke("companies:create", data),
    update: (data: CompanyData): Promise<CompanyData> =>
        ipcRenderer.invoke("companies:update", data),
    delete: (id: string): Promise<void> =>
        ipcRenderer.invoke("companies:delete", id),
}

export type ClientData = {
    id: string
    name: string
    email_primary: string
    email_secondary: string
    phone_primary: string
    phone_secondary: string
    phone_landline: string
    gstin: string
    address: string
    state: string
}

const clientsAPI = {
    getAll: (): Promise<ClientData[]> =>
        ipcRenderer.invoke("clients:getAll"),
    create: (data: ClientData): Promise<ClientData> =>
        ipcRenderer.invoke("clients:create", data),
    update: (data: ClientData): Promise<ClientData> =>
        ipcRenderer.invoke("clients:update", data),
    delete: (id: string): Promise<void> =>
        ipcRenderer.invoke("clients:delete", id),
}

export type InvoiceData = {
    id: string
    company_id: string
    client_id: string
    invoice_number: string
    invoice_date: string   // ISO 8601: "YYYY-MM-DD"
    billed_items: string   // JSON: { items: [...], cgst_percentage, sgst_percentage }
}

export type InvoiceFilter = {
    page: number
    pageSize: number
    companyId?: string
    clientId?: string
    date?: string
}

export type PaginatedInvoicesResult = {
    invoices: InvoiceData[]
    total: number
}

const invoicesAPI = {
    getAll: (): Promise<InvoiceData[]> =>
        ipcRenderer.invoke("invoices:getAll"),
    getById: (id: string): Promise<InvoiceData | undefined> =>
        ipcRenderer.invoke("invoices:getById", id),
    getCount: (): Promise<number> =>
        ipcRenderer.invoke("invoices:getCount"),
    getMaxSeqForCompany: (companyId: string): Promise<number> =>
        ipcRenderer.invoke("invoices:getMaxSeqForCompany", companyId),
    getPaginated: (params: InvoiceFilter): Promise<PaginatedInvoicesResult> =>
        ipcRenderer.invoke("invoices:getPaginated", params),
    create: (data: InvoiceData): Promise<InvoiceData> =>
        ipcRenderer.invoke("invoices:create", data),
    update: (data: InvoiceData): Promise<InvoiceData> =>
        ipcRenderer.invoke("invoices:update", data),
    delete: (id: string): Promise<void> =>
        ipcRenderer.invoke("invoices:delete", id),
}

contextBridge.exposeInMainWorld("electronAPI", {
    companies: companiesAPI,
    clients: clientsAPI,
    invoices: invoicesAPI,
})

declare global {
    interface Window {
        electronAPI: {
            companies: typeof companiesAPI
            clients: typeof clientsAPI
            invoices: typeof invoicesAPI
        }
    }
}