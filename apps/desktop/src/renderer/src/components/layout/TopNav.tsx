import { useAppStore, VIEW_LABELS, type AppView } from '@/store/app-store'
import { cn } from '@/lib/utils'
import LiveButton from './LiveButton'

const VIEWS = Object.keys(VIEW_LABELS) as AppView[]

export default function TopNav(): React.JSX.Element {
  const currentView = useAppStore((s) => s.currentView)
  const setCurrentView = useAppStore((s) => s.setCurrentView)

  return (
    <header
      className="flex h-12 shrink-0 items-center border-b border-border px-4"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Logo */}
      <span className="text-base font-bold tracking-wider text-foreground">Openshow</span>

      {/* Center tabs */}
      <nav className="flex flex-1 items-center justify-center gap-6">
        {VIEWS.map((view) => (
          <button
            key={view}
            onClick={() => setCurrentView(view)}
            className={cn(
              'text-sm font-medium transition-colors',
              currentView === view
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground/70'
            )}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            {VIEW_LABELS[view]}
          </button>
        ))}
      </nav>

      {/* Live button */}
      <LiveButton />
    </header>
  )
}
