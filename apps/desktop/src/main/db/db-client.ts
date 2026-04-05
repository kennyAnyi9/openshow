import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null
let _sqlite: Database.Database | null = null

export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_db) throw new Error('Database not initialized. Call initDb() first.')
  return _db
}

export function getSqlite(): Database.Database {
  if (!_sqlite) throw new Error('Database not initialized. Call initDb() first.')
  return _sqlite
}

export function initDb(): void {
  // Close existing connection if re-initializing
  if (_sqlite) {
    closeDb()
  }

  const dbPath = join(app.getPath('userData'), 'openshow.db')
  _sqlite = new Database(dbPath)

  // Performance and correctness pragmas
  _sqlite.pragma('journal_mode = WAL')
  _sqlite.pragma('foreign_keys = ON')
  _sqlite.pragma('synchronous = NORMAL')
  _sqlite.pragma('cache_size = -32000') // 32MB cache

  _db = drizzle(_sqlite, { schema })
}

export function closeDb(): void {
  try {
    _sqlite?.close()
  } catch (err) {
    _sqlite = null
    _db = null
    throw err
  }
  _sqlite = null
  _db = null
}
