import { ElectronAPI } from '@electron-toolkit/preload'
import type { ToMain, FromMain, ToMainPayloads, FromMainPayloads } from '../types/ipc'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      invoke<C extends ToMain>(
        channel: C,
        args: ToMainPayloads[C]['args']
      ): Promise<ToMainPayloads[C]['return']>
      on<C extends FromMain>(
        channel: C,
        listener: (payload: FromMainPayloads[C]) => void
      ): () => void
    }
  }
}
