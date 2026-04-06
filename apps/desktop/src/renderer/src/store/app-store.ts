import { create } from 'zustand'
import type { Show, Sermon, Hymn } from '../../../main/db/schema'
import type { SlidePayload } from '../../../types/ipc'

export type AppView = 'hymns' | 'table' | 'bible'

export const VIEW_LABELS: Record<AppView, string> = {
  hymns: 'Songs',
  table: 'Table',
  bible: 'Bible'
}

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

  currentSlide: SlidePayload | null
  setCurrentSlide: (slide: SlidePayload | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'hymns',
  setCurrentView: (currentView) => set({ currentView }),

  activeItem: null,
  setActiveItem: (activeItem) => set({ activeItem, activeSlideIndex: 0 }),

  activeSlideIndex: 0,
  setActiveSlideIndex: (activeSlideIndex) => set({ activeSlideIndex }),

  selectedOutputId: null,
  setSelectedOutputId: (selectedOutputId) => set({ selectedOutputId }),

  currentSlide: null,
  setCurrentSlide: (currentSlide) => set({ currentSlide })
}))
