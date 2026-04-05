import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { ToMain, FromMain, ToMainPayloads, FromMainPayloads } from '../types/ipc'

const api = {
  invoke<C extends ToMain>(
    channel: C,
    args: ToMainPayloads[C]['args']
  ): Promise<ToMainPayloads[C]['return']> {
    return ipcRenderer.invoke(channel, args)
  },

  on<C extends FromMain>(
    channel: C,
    listener: (payload: FromMainPayloads[C]) => void
  ): () => void {
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
