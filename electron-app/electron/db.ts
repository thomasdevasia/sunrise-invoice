import { app } from "electron"
import Database from "better-sqlite3"
import path from "node:path"

// ─── Types ────────────────────────────────────────────────────────────────────

export type CompanyRow = {
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
}

export type BilledItem = {
    description: string
    quantity: number
    rate: number
    amount: number
}

export type BilledItems = {
    items: BilledItem[]
    cgst_percentage: number
    sgst_percentage: number
}

export type InvoiceRow = {
    id: string
    company_id: string
    client_id: string
    invoice_number: string
    invoice_date: string   // ISO 8601: "YYYY-MM-DD"
    billed_items: string   // JSON-serialised BilledItems
}

// ─── DB setup ─────────────────────────────────────────────────────────────────

let _db: Database.Database | null = null

export function getDb(): Database.Database {
    if (!_db) {
        const dbPath = path.join(app.getPath("userData"), "sunrise.db")
        _db = new Database(dbPath)
        _db.pragma("journal_mode = WAL")
        migrate(_db)
    }
    return _db
}

function migrate(db: Database.Database) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id             TEXT PRIMARY KEY,
      name           TEXT NOT NULL,
      email_primary  TEXT NOT NULL,
      email_secondary TEXT NOT NULL DEFAULT '',
      phone_primary  TEXT NOT NULL,
      phone_secondary TEXT NOT NULL DEFAULT '',
      phone_landline TEXT NOT NULL DEFAULT '',
      website        TEXT NOT NULL DEFAULT '',
      pan            TEXT NOT NULL,
      gstin          TEXT NOT NULL,
      address        TEXT NOT NULL,
      state          TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS clients (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      email_primary   TEXT NOT NULL,
      email_secondary TEXT NOT NULL DEFAULT '',
      phone_primary   TEXT NOT NULL,
      phone_secondary TEXT NOT NULL DEFAULT '',
      phone_landline  TEXT NOT NULL DEFAULT '',
      gstin           TEXT NOT NULL,
      address         TEXT NOT NULL,
      state           TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id              TEXT PRIMARY KEY,
      company_id      TEXT NOT NULL REFERENCES companies(id),
      client_id       TEXT NOT NULL REFERENCES clients(id),
      invoice_number  TEXT NOT NULL UNIQUE,
      invoice_date    TEXT NOT NULL,
      billed_items    TEXT NOT NULL
    )
  `)
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function getAllCompanies(): CompanyRow[] {
    return getDb().prepare("SELECT * FROM companies ORDER BY name ASC").all() as CompanyRow[]
}

export function createCompany(data: Omit<CompanyRow, never>): CompanyRow {
    getDb()
        .prepare(
            `INSERT INTO companies
        (id, name, email_primary, email_secondary, phone_primary, phone_secondary,
         phone_landline, website, pan, gstin, address, state)
       VALUES
        (@id, @name, @email_primary, @email_secondary, @phone_primary, @phone_secondary,
         @phone_landline, @website, @pan, @gstin, @address, @state)`
        )
        .run(data)
    return getDb().prepare("SELECT * FROM companies WHERE id = ?").get(data.id) as CompanyRow
}

export function updateCompany(data: CompanyRow): CompanyRow {
    getDb()
        .prepare(
            `UPDATE companies SET
        name = @name,
        email_primary = @email_primary,
        email_secondary = @email_secondary,
        phone_primary = @phone_primary,
        phone_secondary = @phone_secondary,
        phone_landline = @phone_landline,
        website = @website,
        pan = @pan,
        gstin = @gstin,
        address = @address,
        state = @state
       WHERE id = @id`
        )
        .run(data)
    return getDb().prepare("SELECT * FROM companies WHERE id = ?").get(data.id) as CompanyRow
}

export function deleteCompany(id: string): void {
    getDb().prepare("DELETE FROM companies WHERE id = ?").run(id)
}

// ─── Clients CRUD ─────────────────────────────────────────────────────────────

export function getAllClients(): ClientRow[] {
    return getDb().prepare("SELECT * FROM clients ORDER BY name ASC").all() as ClientRow[]
}

export function createClient(data: ClientRow): ClientRow {
    getDb()
        .prepare(
            `INSERT INTO clients
        (id, name, email_primary, email_secondary, phone_primary, phone_secondary,
         phone_landline, gstin, address, state)
       VALUES
        (@id, @name, @email_primary, @email_secondary, @phone_primary, @phone_secondary,
         @phone_landline, @gstin, @address, @state)`
        )
        .run(data)
    return getDb().prepare("SELECT * FROM clients WHERE id = ?").get(data.id) as ClientRow
}

export function updateClient(data: ClientRow): ClientRow {
    getDb()
        .prepare(
            `UPDATE clients SET
        name = @name,
        email_primary = @email_primary,
        email_secondary = @email_secondary,
        phone_primary = @phone_primary,
        phone_secondary = @phone_secondary,
        phone_landline = @phone_landline,
        gstin = @gstin,
        address = @address,
        state = @state
       WHERE id = @id`
        )
        .run(data)
    return getDb().prepare("SELECT * FROM clients WHERE id = ?").get(data.id) as ClientRow
}

export function deleteClient(id: string): void {
    getDb().prepare("DELETE FROM clients WHERE id = ?").run(id)
}

// ─── Invoices CRUD ────────────────────────────────────────────────────────────

export function getAllInvoices(): InvoiceRow[] {
    return getDb()
        .prepare("SELECT * FROM invoices ORDER BY invoice_date DESC")
        .all() as InvoiceRow[]
}

export function getInvoiceCount(): number {
    const row = getDb()
        .prepare("SELECT COUNT(*) as count FROM invoices")
        .get() as { count: number }
    return row.count
}

export function createInvoice(data: InvoiceRow): InvoiceRow {
    getDb()
        .prepare(
            `INSERT INTO invoices
         (id, company_id, client_id, invoice_number, invoice_date, billed_items)
       VALUES
         (@id, @company_id, @client_id, @invoice_number, @invoice_date, @billed_items)`
        )
        .run(data)
    return getDb()
        .prepare("SELECT * FROM invoices WHERE id = ?")
        .get(data.id) as InvoiceRow
}

export function updateInvoice(data: InvoiceRow): InvoiceRow {
    getDb()
        .prepare(
            `UPDATE invoices SET
         company_id     = @company_id,
         client_id      = @client_id,
         invoice_number = @invoice_number,
         invoice_date   = @invoice_date,
         billed_items   = @billed_items
        WHERE id = @id`
        )
        .run(data)
    return getDb()
        .prepare("SELECT * FROM invoices WHERE id = ?")
        .get(data.id) as InvoiceRow
}

export function deleteInvoice(id: string): void {
    getDb().prepare("DELETE FROM invoices WHERE id = ?").run(id)
}
