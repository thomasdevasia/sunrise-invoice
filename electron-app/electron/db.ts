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
