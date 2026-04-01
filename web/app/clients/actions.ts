"use server"

import {
    createClient,
    deleteClient,
    getAllClients,
    updateClient,
    type ClientRow,
} from "@/lib/clients_db"

export type ClientResponse = {
    id: string
    name: string
    emailPrimary: string
    emailSecondary: string
    phonePrimary: string
    phoneSecondary: string
    phoneLandline: string
    gstin: string
    state: string
}

function rowToResponse(row: ClientRow): ClientResponse {
    return {
        id: row.id,
        name: row.name,
        emailPrimary: row.email_primary,
        emailSecondary: row.email_secondary,
        phonePrimary: row.phone_primary,
        phoneSecondary: row.phone_secondary,
        phoneLandline: row.phone_landline,
        gstin: row.gstin,
        state: row.state,
    }
}

export async function createClientAction(data: {
    name: string
    emailPrimary: string
    emailSecondary: string
    phonePrimary: string
    phoneSecondary: string
    phoneLandline: string
    gstin: string
    state: string
}): Promise<ClientResponse> {
    const row = createClient({ id: crypto.randomUUID(), ...data })
    return rowToResponse(row)
}

export async function updateClientAction(
    data: ClientResponse
): Promise<ClientResponse> {
    const row = updateClient({
        id: data.id,
        name: data.name,
        emailPrimary: data.emailPrimary,
        emailSecondary: data.emailSecondary,
        phonePrimary: data.phonePrimary,
        phoneSecondary: data.phoneSecondary,
        phoneLandline: data.phoneLandline,
        gstin: data.gstin,
        state: data.state,
    })
    return rowToResponse(row)
}

export async function getClientsAction(): Promise<ClientResponse[]> {
    return getAllClients().map(rowToResponse)
}

export async function deleteClientAction(id: string): Promise<void> {
    deleteClient(id)
}
