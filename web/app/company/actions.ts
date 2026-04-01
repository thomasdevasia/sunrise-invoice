"use server"

import {
    createCompany,
    deleteCompany,
    getAllCompanies,
    updateCompany,
    type CompanyRow,
} from "@/lib/companies_db"

export type CompanyResponse = {
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
    state: string
}

function rowToResponse(row: CompanyRow): CompanyResponse {
    return {
        id: row.id,
        name: row.name,
        emailPrimary: row.email_primary,
        emailSecondary: row.email_secondary,
        phonePrimary: row.phone_primary,
        phoneSecondary: row.phone_secondary,
        phoneLandline: row.phone_landline,
        website: row.website,
        pan: row.pan,
        gstin: row.gstin,
        state: row.state,
    }
}

export async function createCompanyAction(data: {
    name: string
    emailPrimary: string
    emailSecondary: string
    phonePrimary: string
    phoneSecondary: string
    phoneLandline: string
    website: string
    pan: string
    gstin: string
    state: string
}): Promise<CompanyResponse> {
    const row = createCompany({
        id: crypto.randomUUID(),
        ...data,
    })
    return rowToResponse(row)
}

export async function updateCompanyAction(data: CompanyResponse): Promise<CompanyResponse> {
    const row = updateCompany({
        id: data.id,
        name: data.name,
        emailPrimary: data.emailPrimary,
        emailSecondary: data.emailSecondary,
        phonePrimary: data.phonePrimary,
        phoneSecondary: data.phoneSecondary,
        phoneLandline: data.phoneLandline,
        website: data.website,
        pan: data.pan,
        gstin: data.gstin,
        state: data.state,
    })
    return rowToResponse(row)
}

export async function getCompaniesAction(): Promise<CompanyResponse[]> {
    return getAllCompanies().map(rowToResponse)
}

export async function deleteCompanyAction(id: string): Promise<void> {
    deleteCompany(id)
}
