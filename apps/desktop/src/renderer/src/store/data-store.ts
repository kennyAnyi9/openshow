import { create } from 'zustand'
import type { Show, Sermon, Hymn, BibleBook, MediaItem } from '../../../main/db/schema'

interface DataState {
  // Shows
  shows: Show[]
  showsLoaded: boolean
  setShows: (shows: Show[]) => void

  // Sermons
  sermons: Sermon[]
  sermonsLoaded: boolean
  setSermons: (sermons: Sermon[]) => void

  // Hymns
  hymns: Hymn[]
  hymnsLoaded: boolean
  setHymns: (hymns: Hymn[]) => void

  // Bible books — metadata only, verses are fetched on demand
  bibleBooks: BibleBook[]
  bibleBooksLoaded: boolean
  setBibleBooks: (books: BibleBook[]) => void

  // Media
  mediaItems: MediaItem[]
  mediaLoaded: boolean
  setMediaItems: (items: MediaItem[]) => void
  addMediaItemToStore: (item: MediaItem) => void
  removeMediaItemFromStore: (id: string) => void
}

export const useDataStore = create<DataState>((set) => ({
  shows: [],
  showsLoaded: false,
  setShows: (shows) => set({ shows, showsLoaded: true }),

  sermons: [],
  sermonsLoaded: false,
  setSermons: (sermons) => set({ sermons, sermonsLoaded: true }),

  hymns: [],
  hymnsLoaded: false,
  setHymns: (hymns) => set({ hymns, hymnsLoaded: true }),

  bibleBooks: [],
  bibleBooksLoaded: false,
  setBibleBooks: (bibleBooks) => set({ bibleBooks, bibleBooksLoaded: true }),

  mediaItems: [],
  mediaLoaded: false,
  setMediaItems: (mediaItems) => set({ mediaItems, mediaLoaded: true }),
  addMediaItemToStore: (item) =>
    set((state) => ({ mediaItems: [...state.mediaItems, item] })),
  removeMediaItemFromStore: (id) =>
    set((state) => ({ mediaItems: state.mediaItems.filter((m) => m.id !== id) }))
}))
