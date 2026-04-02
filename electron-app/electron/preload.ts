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

contextBridge.exposeInMainWorld("electronAPI", {
    companies: companiesAPI,
})

declare global {
    interface Window {
        electronAPI: {
            companies: typeof companiesAPI
        }
    }
}