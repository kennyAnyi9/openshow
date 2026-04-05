import { BookText, BookOpen, Music2, LayoutTemplate, Settings } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { AppView } from '@/store/app-store'

interface NavItem {
  view: AppView
  icon: React.ElementType
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { view: 'table', icon: BookText, label: 'The Table' },
  { view: 'bible', icon: BookOpen, label: 'Bible' },
  { view: 'hymns', icon: Music2, label: 'Hymns' },
  { view: 'editor', icon: LayoutTemplate, label: 'Editor' }
]

export default function Sidebar(): React.JSX.Element {
  const currentView = useAppStore((s) => s.currentView)
  const setView = useAppStore((s) => s.setCurrentView)

  return (
    <aside className="flex h-full w-14 flex-col border-r border-border bg-card">
      {/* Logo mark */}
      <div className="flex h-12 items-center justify-center border-b border-border">
        <span className="text-xs font-bold tracking-widest text-muted-foreground select-none">
          OS
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-1 flex-col gap-1 p-2 pt-3">
        {NAV_ITEMS.map(({ view, icon: Icon, label }) => (
          <Tooltip key={view} delayDuration={300}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setView(view)}
                className={cn(
                  'flex h-9 w-full items-center justify-center rounded-md transition-colors',
                  currentView === view
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon size={18} strokeWidth={1.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={6}>
              {label}
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="p-2 pb-3">
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setView('media')}
              className={cn(
                'flex h-9 w-full items-center justify-center rounded-md transition-colors',
                currentView === 'media'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Settings size={18} strokeWidth={1.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={6}>
            Settings
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  )
}
