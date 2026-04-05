import { ToMain, FromMain } from '../../../types/ipc'
import type { ToMainPayloads, FromMainPayloads } from '../../../types/ipc'

export function invoke<C extends ToMain>(
  channel: C,
  args: ToMainPayloads[C]['args']
): Promise<ToMainPayloads[C]['return']> {
  return window.api.invoke(channel, args)
}

export function on<C extends FromMain>(
  channel: C,
  listener: (payload: FromMainPayloads[C]) => void
): () => void {
  return window.api.on(channel, listener)
}

// ─── Typed convenience wrappers ───────────────────────────────────────────────

export const ipc = {
  getShows: () => invoke(ToMain.GET_SHOWS, undefined),
  saveShow: (show: ToMainPayloads[typeof ToMain.SAVE_SHOW]['args']) =>
    invoke(ToMain.SAVE_SHOW, show),
  deleteShow: (id: string) => invoke(ToMain.DELETE_SHOW, id),

  getSermons: () => invoke(ToMain.GET_SERMONS, undefined),
  searchSermons: (query: string) => invoke(ToMain.SEARCH_SERMONS, query),
  importSermonPdf: (path: string) => invoke(ToMain.IMPORT_SERMON_PDF, path),

  getBibleBooks: () => invoke(ToMain.GET_BIBLE_BOOKS, undefined),
  getBibleVerses: (bookId: number, chapter: number) =>
    invoke(ToMain.GET_BIBLE_VERSES, { bookId, chapter }),
  searchBible: (query: string) => invoke(ToMain.SEARCH_BIBLE, query),

  getHymns: () => invoke(ToMain.GET_HYMNS, undefined),

  setOutput: (output: ToMainPayloads[typeof ToMain.SET_OUTPUT]['args']) =>
    invoke(ToMain.SET_OUTPUT, output),
  clearOutput: (id: string) => invoke(ToMain.CLEAR_OUTPUT, id),

  openFileDialog: (filters?: { name: string; extensions: string[] }[]) =>
    invoke(ToMain.OPEN_FILE_DIALOG, { filters }),
  getSettings: () => invoke(ToMain.GET_SETTINGS, undefined),
  saveSetting: (key: string, value: unknown) => invoke(ToMain.SAVE_SETTINGS, { key, value }),

  onSermonsLoaded: (cb: (p: FromMainPayloads[typeof FromMain.SERMONS_LOADED]) => void) =>
    on(FromMain.SERMONS_LOADED, cb),
  onOutputUpdated: (cb: (p: FromMainPayloads[typeof FromMain.OUTPUT_UPDATED]) => void) =>
    on(FromMain.OUTPUT_UPDATED, cb),
  onSermonImportProgress: (
    cb: (p: FromMainPayloads[typeof FromMain.SERMON_IMPORT_PROGRESS]) => void
  ) => on(FromMain.SERMON_IMPORT_PROGRESS, cb)
}
