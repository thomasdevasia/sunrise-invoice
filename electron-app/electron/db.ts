import { app } from "electron"
import Database from "better-sqlite3"
import path from "node:path"

// ─── Types ────────────────────────────────────────────────────────────────────

export type CompanyRow = {
    id: string
    name: string
    email_primary: string
    email_secondary: string | null
    phone_primary: string
    phone_secondary: string | null
    phone_landline: string | null
    website: string | null
    pan: string
    gstin: string
    address: string
    state: string
    bank_name: string | null
    bank_account_number: string | null
    bank_branch: string | null
    bank_ifsc: string | null
}

export type ClientRow = {
    id: string
    name: string
    email_primary: string
    email_secondary: string | null
    phone_primary: string
    phone_secondary: string | null
    phone_landline: string | null
    gstin: string
    address: string
    state: string
}

export type BilledItem = {
    description: string
    hsn_sac?: string
    quantity: number
    rate: number
    amount: number
}

export type BilledItems = {
    items: BilledItem[]
    cgst_percentage: number
    sgst_percentage: number
    igst_percentage?: number
}

export type InvoiceRow = {
    id: string
    company_id: string
    bill_to: string             // JSON-serialised InvoiceParty
    ship_to: string             // JSON-serialised InvoiceParty
    ship_same_as_bill: number   // 0 or 1 (SQLite boolean)
    invoice_number: string
    invoice_date: string        // ISO 8601: "YYYY-MM-DD"
    transport_mode: string | null
    vehicle_number: string | null
    billed_items: string        // JSON-serialised BilledItems
    created_at?: string
    updated_at?: string
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

function ensureColumn(
    db: Database.Database,
    table: string,
    columnName: string,
    columnDefinition: string
) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>
    if (!columns.some((column) => column.name === columnName)) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${columnDefinition}`)
    }
}

function migrate(db: Database.Database) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id             TEXT PRIMARY KEY,
      name           TEXT NOT NULL,
      email_primary  TEXT NOT NULL,
      email_secondary TEXT,
      phone_primary  TEXT NOT NULL,
      phone_secondary TEXT,
      phone_landline TEXT,
      website        TEXT,
      pan            TEXT NOT NULL,
      gstin          TEXT NOT NULL,
      address        TEXT NOT NULL,
      state          TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS clients (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      email_primary   TEXT NOT NULL,
      email_secondary TEXT,
      phone_primary   TEXT NOT NULL,
      phone_secondary TEXT,
      phone_landline  TEXT,
      gstin           TEXT NOT NULL,
      address         TEXT NOT NULL,
      state           TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id                  TEXT PRIMARY KEY,
      company_id          TEXT NOT NULL REFERENCES companies(id),
      bill_to             TEXT NOT NULL,
      ship_to             TEXT NOT NULL,
      ship_same_as_bill   INTEGER NOT NULL DEFAULT 1,
      invoice_number      TEXT NOT NULL UNIQUE,
      invoice_date        TEXT NOT NULL,
      transport_mode      TEXT,
      vehicle_number      TEXT,
      billed_items        TEXT NOT NULL,
      created_at          TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at          TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)

    ensureColumn(db, "invoices", "transport_mode", "transport_mode TEXT")
    ensureColumn(db, "invoices", "vehicle_number", "vehicle_number TEXT")
    ensureColumn(db, "companies", "bank_name", "bank_name TEXT")
    ensureColumn(db, "companies", "bank_account_number", "bank_account_number TEXT")
    ensureColumn(db, "companies", "bank_branch", "bank_branch TEXT")
    ensureColumn(db, "companies", "bank_ifsc", "bank_ifsc TEXT")
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
         phone_landline, website, pan, gstin, address, state,
         bank_name, bank_account_number, bank_branch, bank_ifsc)
       VALUES
        (@id, @name, @email_primary, @email_secondary, @phone_primary, @phone_secondary,
         @phone_landline, @website, @pan, @gstin, @address, @state,
         @bank_name, @bank_account_number, @bank_branch, @bank_ifsc)`
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
        state = @state,
        bank_name = @bank_name,
        bank_account_number = @bank_account_number,
        bank_branch = @bank_branch,
        bank_ifsc = @bank_ifsc
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
        .prepare("SELECT * FROM invoices ORDER BY created_at DESC")
        .all() as InvoiceRow[]
}

export function getInvoiceCount(): number {
    const row = getDb()
        .prepare("SELECT COUNT(*) as count FROM invoices")
        .get() as { count: number }
    return row.count
}

export function getMaxInvoiceSeqForCompany(companyId: string): number {
    const row = getDb()
        .prepare(
            `SELECT MAX(CAST(SUBSTR(invoice_number, 1, INSTR(invoice_number, '/') - 1) AS INTEGER)) as max_seq
             FROM invoices
             WHERE company_id = ?`
        )
        .get(companyId) as { max_seq: number | null }
    return row.max_seq ?? 0
}

export function getInvoiceById(id: string): InvoiceRow | undefined {
    return getDb()
        .prepare("SELECT * FROM invoices WHERE id = ?")
        .get(id) as InvoiceRow | undefined
}

export type InvoiceFilter = {
    page: number      // 1-indexed
    pageSize: number  // typically 10
    companyId?: string
    date?: string     // "YYYY-MM-DD" exact match
    invoiceNumber?: string  // partial match
}

export type PaginatedInvoices = {
    invoices: InvoiceRow[]
    total: number
}

export function getInvoicesPaginated(params: InvoiceFilter): PaginatedInvoices {
    const { page, pageSize, companyId, date, invoiceNumber } = params
    const conditions: string[] = []
    const bindings: unknown[] = []

    if (companyId) {
        conditions.push("company_id = ?")
        bindings.push(companyId)
    }
    if (date) {
        conditions.push("invoice_date = ?")
        bindings.push(date)
    }
    if (invoiceNumber) {
        conditions.push("invoice_number LIKE ?")
        bindings.push(`%${invoiceNumber}%`)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
    const offset = (page - 1) * pageSize

    const total = (
        getDb()
            .prepare(`SELECT COUNT(*) as count FROM invoices ${where}`)
            .get(...bindings) as { count: number }
    ).count

    const invoices = getDb()
        .prepare(
            `SELECT * FROM invoices ${where} ORDER BY created_at DESC, invoice_number DESC LIMIT ? OFFSET ?`
        )
        .all(...bindings, pageSize, offset) as InvoiceRow[]

    return { invoices, total }
}

export function createInvoice(data: InvoiceRow): InvoiceRow {
    const now = new Date().toISOString()
    const insertData = { ...data, created_at: now, updated_at: now }
    getDb()
        .prepare(
            `INSERT INTO invoices
         (id, company_id, bill_to, ship_to, ship_same_as_bill, invoice_number, invoice_date, transport_mode, vehicle_number, billed_items, created_at, updated_at)
       VALUES
         (@id, @company_id, @bill_to, @ship_to, @ship_same_as_bill, @invoice_number, @invoice_date, @transport_mode, @vehicle_number, @billed_items, @created_at, @updated_at)`
        )
        .run(insertData)
    return getDb()
        .prepare("SELECT * FROM invoices WHERE id = ?")
        .get(data.id) as InvoiceRow
}

export function updateInvoice(data: InvoiceRow): InvoiceRow {
    const now = new Date().toISOString()
    const updateData = { ...data, updated_at: now }
    getDb()
        .prepare(
            `UPDATE invoices SET
         company_id        = @company_id,
         bill_to           = @bill_to,
         ship_to           = @ship_to,
         ship_same_as_bill = @ship_same_as_bill,
         invoice_number    = @invoice_number,
         invoice_date      = @invoice_date,
         transport_mode    = @transport_mode,
         vehicle_number    = @vehicle_number,
         billed_items      = @billed_items,
         updated_at        = @updated_at
        WHERE id = @id`
        )
        .run(updateData)
    return getDb()
        .prepare("SELECT * FROM invoices WHERE id = ?")
        .get(data.id) as InvoiceRow
}

export function deleteInvoice(id: string): void {
    getDb().prepare("DELETE FROM invoices WHERE id = ?").run(id)
}
