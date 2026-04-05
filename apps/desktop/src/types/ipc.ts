import type { Show, Sermon, Hymn, BibleBook, BibleVerse, Output } from '../main/db/schema'

// ─── Channels: Renderer → Main ───────────────────────────────────────────────

export enum ToMain {
  // Shows
  GET_SHOWS = 'GET_SHOWS',
  SAVE_SHOW = 'SAVE_SHOW',
  DELETE_SHOW = 'DELETE_SHOW',

  // Sermons
  GET_SERMONS = 'GET_SERMONS',
  SEARCH_SERMONS = 'SEARCH_SERMONS',
  IMPORT_SERMON_PDF = 'IMPORT_SERMON_PDF',

  // Bible
  GET_BIBLE_BOOKS = 'GET_BIBLE_BOOKS',
  GET_BIBLE_VERSES = 'GET_BIBLE_VERSES',
  SEARCH_BIBLE = 'SEARCH_BIBLE',

  // Hymns
  GET_HYMNS = 'GET_HYMNS',

  // Output windows
  SET_OUTPUT = 'SET_OUTPUT',
  CLEAR_OUTPUT = 'CLEAR_OUTPUT',
  CREATE_OUTPUT_WINDOW = 'CREATE_OUTPUT_WINDOW',
  CLOSE_OUTPUT_WINDOW = 'CLOSE_OUTPUT_WINDOW',
  PROJECT_SLIDE = 'PROJECT_SLIDE',

  // System
  OPEN_FILE_DIALOG = 'OPEN_FILE_DIALOG',
  GET_SETTINGS = 'GET_SETTINGS',
  SAVE_SETTINGS = 'SAVE_SETTINGS'
}

// ─── Channels: Main → Renderer ───────────────────────────────────────────────

export enum FromMain {
  SHOWS_LOADED = 'SHOWS_LOADED',
  SERMONS_LOADED = 'SERMONS_LOADED',
  SETTINGS_LOADED = 'SETTINGS_LOADED',
  OUTPUT_UPDATED = 'OUTPUT_UPDATED',
  SERMON_IMPORT_PROGRESS = 'SERMON_IMPORT_PROGRESS',
  // Sent to output windows
  SLIDE_UPDATE = 'SLIDE_UPDATE',
  SLIDE_CLEAR = 'SLIDE_CLEAR'
}

// ─── Payload types ───────────────────────────────────────────────────────────

export type IpcResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export interface ToMainPayloads {
  [ToMain.GET_SHOWS]: { args: void; return: IpcResult<Show[]> }
  [ToMain.SAVE_SHOW]: { args: Show; return: IpcResult<void> }
  [ToMain.DELETE_SHOW]: { args: string; return: IpcResult<void> }

  [ToMain.GET_SERMONS]: { args: void; return: IpcResult<Sermon[]> }
  [ToMain.SEARCH_SERMONS]: { args: string; return: IpcResult<Sermon[]> }
  [ToMain.IMPORT_SERMON_PDF]: { args: string; return: IpcResult<Sermon> }

  [ToMain.GET_BIBLE_BOOKS]: { args: void; return: IpcResult<BibleBook[]> }
  [ToMain.GET_BIBLE_VERSES]: {
    args: { bookId: number; chapter: number }
    return: IpcResult<BibleVerse[]>
  }
  [ToMain.SEARCH_BIBLE]: { args: string; return: IpcResult<BibleVerse[]> }

  [ToMain.GET_HYMNS]: { args: void; return: IpcResult<Hymn[]> }

  [ToMain.SET_OUTPUT]: { args: Partial<Output> & { id: string }; return: IpcResult<void> }
  [ToMain.CLEAR_OUTPUT]: { args: string; return: IpcResult<void> }
  [ToMain.CREATE_OUTPUT_WINDOW]: { args: { outputId: string; displayIndex?: number }; return: IpcResult<void> }
  [ToMain.CLOSE_OUTPUT_WINDOW]: { args: string; return: IpcResult<void> }
  [ToMain.PROJECT_SLIDE]: { args: { outputId: string; slide: SlidePayload }; return: IpcResult<void> }

  [ToMain.OPEN_FILE_DIALOG]: {
    args: { filters?: { name: string; extensions: string[] }[] }
    return: IpcResult<string | null>
  }
  [ToMain.GET_SETTINGS]: { args: void; return: IpcResult<Record<string, unknown>> }
  [ToMain.SAVE_SETTINGS]: {
    args: { key: string; value: unknown }
    return: IpcResult<void>
  }
}

// Slide payload sent to output windows
export interface SlidePayload {
  text?: string
  background?: string
  items?: { id?: string; type: string; style?: string; content?: unknown }[]
}

export interface FromMainPayloads {
  [FromMain.SHOWS_LOADED]: Show[]
  [FromMain.SERMONS_LOADED]: Sermon[]
  [FromMain.SETTINGS_LOADED]: Record<string, unknown>
  [FromMain.OUTPUT_UPDATED]: Output
  [FromMain.SERMON_IMPORT_PROGRESS]: { progress: number; total: number; title: string }
  [FromMain.SLIDE_UPDATE]: SlidePayload
  [FromMain.SLIDE_CLEAR]: void
}
