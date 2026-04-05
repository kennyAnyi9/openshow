import { app } from 'electron'
import { join } from 'path'
import { readFileSync } from 'fs'
import { getSqlite } from './db-client'

interface KjvBook {
  abbrev: string
  name: string
  chapters: string[][]
}

export function seedBibleIfEmpty(): void {
  const sqlite = getSqlite()

  const count = (sqlite.prepare('SELECT COUNT(*) as n FROM bible_books').get() as { n: number }).n
  if (count > 0) return

  const kjvPath = app.isPackaged
    ? join(process.resourcesPath, 'kjv.json')
    : join(__dirname, '../../resources/kjv.json')

  const books: KjvBook[] = JSON.parse(readFileSync(kjvPath, 'utf8'))

  const insertBook = sqlite.prepare(
    'INSERT INTO bible_books (id, name, abbreviation, testament) VALUES (?, ?, ?, ?)'
  )
  const insertVerse = sqlite.prepare(
    'INSERT INTO bible_verses (book_id, chapter, verse, text) VALUES (?, ?, ?, ?)'
  )

  const seed = sqlite.transaction(() => {
    for (let bi = 0; bi < books.length; bi++) {
      const book = books[bi]
      const bookId = bi + 1
      const testament = bi < 39 ? 'OT' : 'NT'
      insertBook.run(bookId, book.name, book.abbrev, testament)

      for (let ci = 0; ci < book.chapters.length; ci++) {
        const chapter = book.chapters[ci]
        for (let vi = 0; vi < chapter.length; vi++) {
          insertVerse.run(bookId, ci + 1, vi + 1, chapter[vi])
        }
      }
    }
  })

  seed()
  console.log('[bible-seeder] Seeded 66 books and 31,100 verses')
}
