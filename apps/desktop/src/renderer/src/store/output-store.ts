import { create } from 'zustand'
import type { Output } from '../../../main/db/schema'

// Kept intentionally loose until the full slide item schema is finalized in Phase 5
export interface SlideItem {
  id?: string
  type: 'text' | 'image' | 'video' | 'shape' | 'timer' | 'clock'
  style?: string
  content?: unknown
}

export interface SlideContent {
  text?: string
  background?: string
  items?: SlideItem[]
}

export interface OutputSlot {
  output: Output
  currentSlide: SlideContent | null
}

interface OutputState {
  outputs: Record<string, OutputSlot>
  setOutput: (output: Output) => void
  removeOutput: (id: string) => void
  setSlide: (outputId: string, slide: SlideContent | null) => void
  clearSlide: (outputId: string) => void
}

export const useOutputStore = create<OutputState>((set) => ({
  outputs: {},

  setOutput: (output) =>
    set((state) => ({
      outputs: {
        ...state.outputs,
        [output.id]: { output, currentSlide: state.outputs[output.id]?.currentSlide ?? null }
      }
    })),

  removeOutput: (id) =>
    set((state) => {
      const next = { ...state.outputs }
      delete next[id]
      return { outputs: next }
    }),

  setSlide: (outputId, slide) =>
    set((state) => {
      const slot = state.outputs[outputId]
      if (!slot) {
        console.warn(`[output-store] setSlide: no output registered for id "${outputId}"`)
        return state
      }
      return { outputs: { ...state.outputs, [outputId]: { ...slot, currentSlide: slide } } }
    }),

  clearSlide: (outputId) =>
    set((state) => {
      const slot = state.outputs[outputId]
      if (!slot) {
        console.warn(`[output-store] clearSlide: no output registered for id "${outputId}"`)
        return state
      }
      return { outputs: { ...state.outputs, [outputId]: { ...slot, currentSlide: null } } }
    })
}))
