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

contextBridge.exposeInMainWorld("electronAPI", {
    companies: companiesAPI,
    clients: clientsAPI,
})

declare global {
    interface Window {
        electronAPI: {
            companies: typeof companiesAPI
            clients: typeof clientsAPI
        }
    }
}