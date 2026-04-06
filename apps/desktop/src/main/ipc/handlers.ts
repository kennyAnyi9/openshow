import { ipcMain, dialog, screen } from 'electron'
import { execSync } from 'child_process'
import { and, eq, like } from 'drizzle-orm'
import { getDb } from '../db/db-client'
import { randomUUID } from 'crypto'
import { basename, extname } from 'path'
import { shows, sermons, hymns, bibleBooks, bibleVerses, settings, outputs, mediaItems } from '../db/schema'
import { ToMain } from '../../types/ipc'
import type { IpcResult } from '../../types/ipc'
import {
  createOutputWindow,
  closeOutputWindow,
  projectSlide,
  clearOutputWindow
} from '../output/output-manager'

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
          .where(and(eq(bibleVerses.bookId, bookId), eq(bibleVerses.chapter, chapter)))
          .all()
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
      const existing = db.select().from(outputs).where(eq(outputs.id, output.id)).get()
      if (existing) {
        db.update(outputs).set(output).where(eq(outputs.id, output.id)).run()
      } else {
        if (!output.name) return err(new Error('output.name is required when creating a new output'))
        db.insert(outputs).values(output as typeof outputs.$inferInsert).run()
      }
      return ok(undefined)
    } catch (e) {
      return err(e)
    }
  })

  // ─── Output windows ────────────────────────────────────────────────────────

  ipcMain.handle(ToMain.CREATE_OUTPUT_WINDOW, (_event, { outputId, displayIndex, hyprlandName }) => {
    try {
      createOutputWindow(outputId, displayIndex, hyprlandName)
      return ok(undefined)
    } catch (e) {
      return err(e)
    }
  })

  ipcMain.handle(ToMain.CLOSE_OUTPUT_WINDOW, (_event, outputId: string) => {
    try {
      closeOutputWindow(outputId)
      return ok(undefined)
    } catch (e) {
      return err(e)
    }
  })

  ipcMain.handle(ToMain.PROJECT_SLIDE, (_event, { outputId, slide }) => {
    try {
      projectSlide(outputId, slide)
      return ok(undefined)
    } catch (e) {
      return err(e)
    }
  })

  ipcMain.handle(ToMain.CLEAR_OUTPUT, (_event, id: string) => {
    try {
      clearOutputWindow(id)
      return ok(undefined)
    } catch (e) {
      return err(e)
    }
  })

  // ─── Media ─────────────────────────────────────────────────────────────────

  ipcMain.handle(ToMain.GET_MEDIA_ITEMS, () => {
    try {
      return ok(db.select().from(mediaItems).all())
    } catch (e) {
      return err(e)
    }
  })

  ipcMain.handle(ToMain.ADD_MEDIA_ITEM, (_event, { filePath }: { filePath: string }) => {
    try {
      const ext = extname(filePath).toLowerCase()
      const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
      const videoExts = ['.mp4', '.webm', '.mov', '.avi', '.mkv']
      const type = imageExts.includes(ext) ? 'image' : videoExts.includes(ext) ? 'video' : null
      if (!type) return err(new Error(`Unsupported file type: ${ext}`))

      const mimeMap: Record<string, string> = {
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
        '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp',
        '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm',
        '.mov': 'video/quicktime', '.avi': 'video/x-msvideo', '.mkv': 'video/x-matroska'
      }

      const item = {
        id: randomUUID(),
        name: basename(filePath),
        path: filePath,
        type: type as 'image' | 'video',
        mimeType: mimeMap[ext] ?? null
      }
      db.insert(mediaItems).values(item).run()
      return ok({ ...item, createdAt: new Date() })
    } catch (e) {
      return err(e)
    }
  })

  ipcMain.handle(ToMain.DELETE_MEDIA_ITEM, (_event, id: string) => {
    try {
      db.delete(mediaItems).where(eq(mediaItems.id, id)).run()
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

  ipcMain.handle(ToMain.GET_DISPLAYS, () => {
    try {
      // Try to get Hyprland monitor names for accurate multi-monitor placement
      let hyprMonitors: { id: number; name: string }[] = []
      try {
        hyprMonitors = JSON.parse(execSync('hyprctl monitors -j', { timeout: 1000 }).toString())
      } catch {
        // Not on Hyprland or hyprctl unavailable — fall back to Electron screen API
      }

      const displays = screen.getAllDisplays().map((d, index) => ({
        index,
        label: hyprMonitors[index]?.name ?? d.label ?? `Display ${index + 1}`,
        width: d.bounds.width,
        height: d.bounds.height,
        hyprlandName: hyprMonitors[index]?.name
      }))
      return ok(displays)
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
