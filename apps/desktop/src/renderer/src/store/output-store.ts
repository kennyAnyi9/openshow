import { create } from 'zustand'
import type { Output } from '../../../main/db/schema'

export interface SlideContent {
  text?: string
  background?: string
  items?: unknown[]
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
      if (!slot) return state
      return { outputs: { ...state.outputs, [outputId]: { ...slot, currentSlide: slide } } }
    }),

  clearSlide: (outputId) =>
    set((state) => {
      const slot = state.outputs[outputId]
      if (!slot) return state
      return { outputs: { ...state.outputs, [outputId]: { ...slot, currentSlide: null } } }
    })
}))
