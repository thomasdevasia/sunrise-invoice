import { getDb } from "./db"

export type ClientRow = {
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
    created_at: string
    updated_at: string
}

function ensureClientsTable() {
    const db = getDb()
    const table = db
        .prepare(
            `SELECT name FROM sqlite_master WHERE type='table' AND name='clients'`
        )
        .get() as { name: string } | undefined

    if (!table) {
        db.exec(`
      CREATE TABLE clients (
        id              TEXT PRIMARY KEY,
        name            TEXT NOT NULL,
        email_primary   TEXT NOT NULL,
        email_secondary TEXT DEFAULT '',
        phone_primary   TEXT NOT NULL,
        phone_secondary TEXT DEFAULT '',
        phone_landline  TEXT DEFAULT '',
        gstin           TEXT NOT NULL,
        address         TEXT DEFAULT '',
        state           TEXT NOT NULL,
        created_at      TEXT DEFAULT (datetime('now')),
        updated_at      TEXT DEFAULT (datetime('now'))
      );
    `)
    }
}

export function createClient(client: {
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
}): ClientRow {
    ensureClientsTable()
    const db = getDb()

    db.prepare(`
    INSERT INTO clients (id, name, email_primary, email_secondary, phone_primary, phone_secondary, phone_landline, gstin, address, state)
    VALUES (@id, @name, @emailPrimary, @emailSecondary, @phonePrimary, @phoneSecondary, @phoneLandline, @gstin, @address, @state)
  `).run({
        id: client.id,
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

    return db
        .prepare(`SELECT * FROM clients WHERE id = ?`)
        .get(client.id) as ClientRow
}

export function updateClient(client: {
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
}): ClientRow {
    ensureClientsTable()
    const db = getDb()

    db.prepare(`
    UPDATE clients SET
      name            = @name,
      email_primary   = @emailPrimary,
      email_secondary = @emailSecondary,
      phone_primary   = @phonePrimary,
      phone_secondary = @phoneSecondary,
      phone_landline  = @phoneLandline,
      gstin           = @gstin,
      address         = @address,
      state           = @state,
      updated_at      = datetime('now')
    WHERE id = @id
  `).run({
        id: client.id,
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

    return db
        .prepare(`SELECT * FROM clients WHERE id = ?`)
        .get(client.id) as ClientRow
}

export function getAllClients(): ClientRow[] {
    ensureClientsTable()
    const db = getDb()
    return db
        .prepare(`SELECT * FROM clients ORDER BY created_at DESC`)
        .all() as ClientRow[]
}

export function deleteClient(id: string): void {
    ensureClientsTable()
    const db = getDb()
    db.prepare(`DELETE FROM clients WHERE id = ?`).run(id)
}
