import { ipcMain, dialog } from 'electron'
import { eq, like } from 'drizzle-orm'
import { getDb } from '../db/db-client'
import { shows, sermons, hymns, bibleBooks, bibleVerses, settings, outputs } from '../db/schema'
import { ToMain } from '../../types/ipc'
import type { IpcResult } from '../../types/ipc'

function ok<T>(data: T): IpcResult<T> {
  return { success: true, data }
}

function err(error: unknown): IpcResult<never> {
  return { success: false, error: error instanceof Error ? error.message : String(error) }
}

export function registerIpcHandlers(): void {
  const db = getDb()

  // ─── Shows ─────────────────────────────────────────────────────────────────

  ipcMain.handle(ToMain.GET_SHOWS, () => {
    try {
      return ok(db.select().from(shows).all())
    } catch (e) {
      return err(e)
    }
  })

  ipcMain.handle(ToMain.SAVE_SHOW, (_event, show) => {
    try {
      db.insert(shows).values(show).onConflictDoUpdate({ target: shows.id, set: show }).run()
      return ok(undefined)
    } catch (e) {
      return err(e)
    }
  })

  ipcMain.handle(ToMain.DELETE_SHOW, (_event, id: string) => {
    try {
      db.delete(shows).where(eq(shows.id, id)).run()
      return ok(undefined)
    } catch (e) {
      return err(e)
    }
  })

  // ─── Sermons ───────────────────────────────────────────────────────────────

  ipcMain.handle(ToMain.GET_SERMONS, () => {
    try {
      return ok(db.select().from(sermons).all())
    } catch (e) {
      return err(e)
    }
  })

  ipcMain.handle(ToMain.SEARCH_SERMONS, (_event, query: string) => {
    try {
      const term = `%${query}%`
      return ok(
        db
          .select()
          .from(sermons)
          .where(like(sermons.title, term))
          .all()
      )
    } catch (e) {
      return err(e)
    }
  })

  // IMPORT_SERMON_PDF is handled separately in sermon-importer.ts (Phase 6)
  ipcMain.handle(ToMain.IMPORT_SERMON_PDF, () => {
    return err('Not implemented yet')
  })

  // ─── Bible ─────────────────────────────────────────────────────────────────

  ipcMain.handle(ToMain.GET_BIBLE_BOOKS, () => {
    try {
      return ok(db.select().from(bibleBooks).all())
    } catch (e) {
      return err(e)
    }
  })

  ipcMain.handle(ToMain.GET_BIBLE_VERSES, (_event, { bookId, chapter }) => {
    try {
      return ok(
        db
          .select()
          .from(bibleVerses)
          .where(eq(bibleVerses.bookId, bookId))
          .all()
          .filter((v) => v.chapter === chapter)
      )
    } catch (e) {
      return err(e)
    }
  })

  ipcMain.handle(ToMain.SEARCH_BIBLE, (_event, query: string) => {
    try {
      return ok(
        db
          .select()
          .from(bibleVerses)
          .where(like(bibleVerses.text, `%${query}%`))
          .limit(50)
          .all()
      )
    } catch (e) {
      return err(e)
    }
  })

  // ─── Hymns ─────────────────────────────────────────────────────────────────

  ipcMain.handle(ToMain.GET_HYMNS, () => {
    try {
      return ok(db.select().from(hymns).all())
    } catch (e) {
      return err(e)
    }
  })

  // ─── Output ────────────────────────────────────────────────────────────────

  ipcMain.handle(ToMain.SET_OUTPUT, (_event, output) => {
    try {
      db.insert(outputs)
        .values(output)
        .onConflictDoUpdate({ target: outputs.id, set: output })
        .run()
      return ok(undefined)
    } catch (e) {
      return err(e)
    }
  })

  ipcMain.handle(ToMain.CLEAR_OUTPUT, (_event, id: string) => {
    try {
      db.delete(outputs).where(eq(outputs.id, id)).run()
      return ok(undefined)
    } catch (e) {
      return err(e)
    }
  })

  // ─── System ────────────────────────────────────────────────────────────────

  ipcMain.handle(ToMain.OPEN_FILE_DIALOG, async (_event, { filters } = {}) => {
    try {
      const result = await dialog.showOpenDialog({ properties: ['openFile'], filters })
      if (result.canceled || result.filePaths.length === 0) return ok(null)
      return ok(result.filePaths[0])
    } catch (e) {
      return err(e)
    }
  })

  ipcMain.handle(ToMain.GET_SETTINGS, () => {
    try {
      const rows = db.select().from(settings).all()
      const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
      return ok(map)
    } catch (e) {
      return err(e)
    }
  })

  ipcMain.handle(ToMain.SAVE_SETTINGS, (_event, { key, value }) => {
    try {
      db.insert(settings)
        .values({ key, value })
        .onConflictDoUpdate({ target: settings.key, set: { value } })
        .run()
      return ok(undefined)
    } catch (e) {
      return err(e)
    }
  })
}
