import { create } from 'zustand'
import type { Show, Sermon, Hymn } from '../../../main/db/schema'

export type AppView = 'table' | 'hymns' | 'bible' | 'media' | 'editor'

export type ActiveItem =
  | { type: 'show'; data: Show }
  | { type: 'sermon'; data: Sermon }
  | { type: 'hymn'; data: Hymn }
  | null

interface AppState {
  currentView: AppView
  setCurrentView: (view: AppView) => void

  activeItem: ActiveItem
  setActiveItem: (item: ActiveItem) => void

  activeSlideIndex: number
  setActiveSlideIndex: (index: number) => void

  selectedOutputId: string | null
  setSelectedOutputId: (id: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'table',
  setCurrentView: (currentView) => set({ currentView }),

  activeItem: null,
  setActiveItem: (activeItem) => set({ activeItem, activeSlideIndex: 0 }),

  activeSlideIndex: 0,
  setActiveSlideIndex: (activeSlideIndex) => set({ activeSlideIndex }),

  selectedOutputId: null,
  setSelectedOutputId: (selectedOutputId) => set({ selectedOutputId })
}))
