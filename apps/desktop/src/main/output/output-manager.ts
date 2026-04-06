import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { execSync } from 'child_process'
import { is } from '@electron-toolkit/utils'
import { FromMain } from '../../types/ipc'
import type { SlidePayload } from '../../types/ipc'

interface OutputEntry {
  window: BrowserWindow
  displayIndex: number
}

const outputWindows = new Map<string, OutputEntry>()

export function createOutputWindow(outputId: string, displayIndex = 0, hyprlandName?: string): void {
  if (outputWindows.has(outputId)) {
    outputWindows.get(outputId)!.window.focus()
    return
  }

  const displays = screen.getAllDisplays()
  const display = displays[displayIndex] ?? displays[0]
  const { x, y, width, height } = display.bounds

  const win = new BrowserWindow({
    x,
    y,
    width,
    height,
    show: false,
    frame: false,
    alwaysOnTop: true,
    backgroundColor: '#000000',
    title: `openshow-output-${outputId}`,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  win.on('ready-to-show', () => {
    win.show()

    if (hyprlandName) {
      // Hyprland (Wayland) ignores x,y position hints — move via hyprctl instead
      try {
        win.focus()
        execSync(`hyprctl dispatch movewindow mon:${hyprlandName}`, { timeout: 1000 })
      } catch (e) {
        console.warn('[output-manager] hyprctl movewindow failed:', e)
      }
    }

    win.setFullScreen(true)
  })

  win.on('closed', () => {
    outputWindows.delete(outputId)
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/output.html`)
  } else {
    win.loadFile(join(__dirname, '../../renderer/output.html'))
  }

  outputWindows.set(outputId, { window: win, displayIndex })
}

export function closeOutputWindow(outputId: string): void {
  const entry = outputWindows.get(outputId)
  if (!entry) return
  entry.window.close()
  outputWindows.delete(outputId)
}

export function projectSlide(outputId: string, slide: SlidePayload): void {
  const entry = outputWindows.get(outputId)
  if (!entry) {
    console.warn(`[output-manager] projectSlide: no window for outputId "${outputId}"`)
    return
  }
  entry.window.webContents.send(FromMain.SLIDE_UPDATE, slide)
}

export function clearOutputWindow(outputId: string): void {
  const entry = outputWindows.get(outputId)
  if (!entry) return
  entry.window.webContents.send(FromMain.SLIDE_CLEAR)
}

export function closeAllOutputWindows(): void {
  for (const [id] of outputWindows) {
    closeOutputWindow(id)
  }
}
