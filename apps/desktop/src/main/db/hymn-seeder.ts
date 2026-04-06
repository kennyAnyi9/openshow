import { app } from 'electron'
import { join } from 'path'
import { readFileSync } from 'fs'
import { getSqlite } from './db-client'

interface HymnVerse {
  label: string
  lines: string[]
}

interface HymnEntry {
  id: string
  title: string
  author: string
  year: number
  verses: HymnVerse[]
}

export function seedHymnsIfEmpty(): void {
  const sqlite = getSqlite()

  const count = (sqlite.prepare('SELECT COUNT(*) as n FROM hymns').get() as { n: number }).n
  if (count > 0) return

  const hymnsPath = app.isPackaged
    ? join(process.resourcesPath, 'hymns.json')
    : join(__dirname, '../../resources/hymns.json')

  const hymns: HymnEntry[] = JSON.parse(readFileSync(hymnsPath, 'utf8'))

  const insert = sqlite.prepare(
    'INSERT INTO hymns (id, title, author, verses) VALUES (?, ?, ?, ?)'
  )

  const seed = sqlite.transaction(() => {
    for (const hymn of hymns) {
      insert.run(hymn.id, hymn.title, hymn.author ?? null, JSON.stringify(hymn.verses))
    }
  })

  seed()
  console.log(`[hymn-seeder] Seeded ${hymns.length} hymns`)
}
