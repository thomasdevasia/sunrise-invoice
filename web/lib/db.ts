import Database from "better-sqlite3"
import fs from "node:fs"
import path from "node:path"

const DB_DIR = path.join(process.cwd(), ".data")
const DB_PATH = path.join(DB_DIR, "sunrise.db")

let _db: Database.Database | null = null

// function initSchema(db: Database.Database) {
//     db.exec(`
//     CREATE TABLE IF NOT EXISTS companies (
//       id            TEXT PRIMARY KEY,
//       name          TEXT NOT NULL,
//       email_primary TEXT NOT NULL,
//       email_secondary TEXT DEFAULT '',
//       phone_primary TEXT NOT NULL,
//       phone_secondary TEXT DEFAULT '',
//       phone_landline  TEXT DEFAULT '',
//       website       TEXT DEFAULT '',
//       pan           TEXT NOT NULL,
//       gstin         TEXT NOT NULL,
//       state         TEXT NOT NULL,
//       created_at    TEXT DEFAULT (datetime('now')),
//       updated_at    TEXT DEFAULT (datetime('now'))
//     );
//   `)
// }

export function getDb(): Database.Database {
    if (_db) return _db

    const exists = fs.existsSync(DB_PATH)

    if (!exists) {
        fs.mkdirSync(DB_DIR, { recursive: true })
    }

    _db = new Database(DB_PATH)
    _db.pragma("journal_mode = WAL")
    _db.pragma("foreign_keys = ON")

    // if (!exists) {
    //     initSchema(_db)
    // }

    return _db
}