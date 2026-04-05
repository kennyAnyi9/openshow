import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ToMain, FromMain } from '../types/ipc'
import type { ToMainPayloads, FromMainPayloads } from '../types/ipc'

const ALLOWED_INVOKE = new Set<string>(Object.values(ToMain))
const ALLOWED_ON = new Set<string>(Object.values(FromMain))

const api = {
  invoke<C extends ToMain>(
    channel: C,
    args: ToMainPayloads[C]['args']
  ): Promise<ToMainPayloads[C]['return']> {
    if (!ALLOWED_INVOKE.has(channel)) {
      return Promise.reject(new Error(`[ipc] Unknown invoke channel: ${channel}`))
    }
    return ipcRenderer.invoke(channel, args)
  },

  on<C extends FromMain>(
    channel: C,
    listener: (payload: FromMainPayloads[C]) => void
  ): () => void {
    if (!ALLOWED_ON.has(channel)) {
      throw new Error(`[ipc] Unknown event channel: ${channel}`)
    }
    const handler = (_event: Electron.IpcRendererEvent, payload: FromMainPayloads[C]): void =>
      listener(payload)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
