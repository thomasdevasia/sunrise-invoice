import { getDb } from "./db"

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
    state: string
    created_at: string
    updated_at: string
}

function ensureCompaniesTable() {
    const db = getDb()
    const table = db
        .prepare(
            `SELECT name FROM sqlite_master WHERE type='table' AND name='companies'`
        )
        .get() as { name: string } | undefined

    if (!table) {
        db.exec(`
      CREATE TABLE companies (
        id              TEXT PRIMARY KEY,
        name            TEXT NOT NULL,
        email_primary   TEXT NOT NULL,
        email_secondary TEXT DEFAULT '',
        phone_primary   TEXT NOT NULL,
        phone_secondary TEXT DEFAULT '',
        phone_landline  TEXT DEFAULT '',
        website         TEXT DEFAULT '',
        pan             TEXT NOT NULL,
        gstin           TEXT NOT NULL,
        state           TEXT NOT NULL,
        created_at      TEXT DEFAULT (datetime('now')),
        updated_at      TEXT DEFAULT (datetime('now'))
      );
    `)
    }
}

export function createCompany(company: {
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
}): CompanyRow {
    ensureCompaniesTable()
    const db = getDb()

    const stmt = db.prepare(`
    INSERT INTO companies (id, name, email_primary, email_secondary, phone_primary, phone_secondary, phone_landline, website, pan, gstin, state)
    VALUES (@id, @name, @emailPrimary, @emailSecondary, @phonePrimary, @phoneSecondary, @phoneLandline, @website, @pan, @gstin, @state)
  `)

    stmt.run({
        id: company.id,
        name: company.name,
        emailPrimary: company.emailPrimary,
        emailSecondary: company.emailSecondary,
        phonePrimary: company.phonePrimary,
        phoneSecondary: company.phoneSecondary,
        phoneLandline: company.phoneLandline,
        website: company.website,
        pan: company.pan,
        gstin: company.gstin,
        state: company.state,
    })

    return db
        .prepare(`SELECT * FROM companies WHERE id = ?`)
        .get(company.id) as CompanyRow
}

export function getAllCompanies(): CompanyRow[] {
    ensureCompaniesTable()
    const db = getDb()
    return db
        .prepare(`SELECT * FROM companies ORDER BY created_at DESC`)
        .all() as CompanyRow[]
}

export function updateCompany(company: {
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
}): CompanyRow {
    ensureCompaniesTable()
    const db = getDb()

    db.prepare(`
    UPDATE companies SET
      name            = @name,
      email_primary   = @emailPrimary,
      email_secondary = @emailSecondary,
      phone_primary   = @phonePrimary,
      phone_secondary = @phoneSecondary,
      phone_landline  = @phoneLandline,
      website         = @website,
      pan             = @pan,
      gstin           = @gstin,
      state           = @state,
      updated_at      = datetime('now')
    WHERE id = @id
  `).run({
        id: company.id,
        name: company.name,
        emailPrimary: company.emailPrimary,
        emailSecondary: company.emailSecondary,
        phonePrimary: company.phonePrimary,
        phoneSecondary: company.phoneSecondary,
        phoneLandline: company.phoneLandline,
        website: company.website,
        pan: company.pan,
        gstin: company.gstin,
        state: company.state,
    })

    return db
        .prepare(`SELECT * FROM companies WHERE id = ?`)
        .get(company.id) as CompanyRow
}

export function deleteCompany(id: string): void {
    ensureCompaniesTable()
    const db = getDb()
    db.prepare(`DELETE FROM companies WHERE id = ?`).run(id)
}