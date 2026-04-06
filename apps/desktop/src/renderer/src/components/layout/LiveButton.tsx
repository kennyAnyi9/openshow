import { useState, useEffect } from 'react'
import { Monitor, MonitorOff } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { ipc } from '@/ipc/bridge'
import { useAppStore } from '@/store/app-store'
import type { DisplayInfo } from '../../../../types/ipc'

export default function LiveButton(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [displays, setDisplays] = useState<DisplayInfo[]>([])
  const selectedOutputId = useAppStore((s) => s.selectedOutputId)
  const setSelectedOutputId = useAppStore((s) => s.setSelectedOutputId)

  useEffect(() => {
    if (!open) return
    ipc.getDisplays().then((result) => {
      if (result.success) setDisplays(result.data)
    })
  }, [open])

  async function activate(display: DisplayInfo): Promise<void> {
    const outputId = `display-${display.index}`
    await ipc.setOutput({ id: outputId, name: display.label })
    await ipc.createOutputWindow(outputId, display.index, display.hyprlandName)
    setSelectedOutputId(outputId)
  }

  async function deactivate(): Promise<void> {
    if (!selectedOutputId) return
    await ipc.closeOutputWindow(selectedOutputId)
    setSelectedOutputId(null)
  }

  const isActive = !!selectedOutputId

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            isActive
              ? 'text-live'
              : 'text-muted-foreground hover:text-foreground'
          )}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {isActive && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
            </span>
          )}
          Live
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-64 p-0">
        <div className="px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Output
          </p>
        </div>
        <Separator />

        <div className="p-2">
          {displays.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">Loading displays…</p>
          ) : (
            displays.map((display) => {
              const id = `display-${display.index}`
              const active = selectedOutputId === id
              return (
                <button
                  key={display.index}
                  onClick={() => (active ? deactivate() : activate(display))}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50 hover:text-accent-foreground'
                  )}
                >
                  {active ? (
                    <MonitorOff size={15} className="shrink-0 text-muted-foreground" />
                  ) : (
                    <Monitor size={15} className="shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{display.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {display.width} × {display.height}
                    </p>
                  </div>
                  {active && (
                    <span className="shrink-0 text-xs text-muted-foreground">Active</span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {isActive && (
          <>
            <Separator />
            <div className="p-2">
              <button
                onClick={deactivate}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <MonitorOff size={14} />
                Stop output
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
