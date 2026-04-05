import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Sermon } from '../../../../main/db/schema'

interface SermonListProps {
  sermons: Sermon[]
  selected: Sermon | null
  onSelect: (sermon: Sermon) => void
}

export default function SermonList({
  sermons,
  selected,
  onSelect
}: SermonListProps): React.JSX.Element {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? sermons.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          (s.date ?? '').includes(query) ||
          (s.location ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : sermons

  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          The Table
        </span>
        <span className="text-xs text-muted-foreground">{sermons.length}</span>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sermons…"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {sermons.length === 0 ? 'No sermons yet' : 'No matches'}
            </p>
          </div>
        ) : (
          <ul className="p-2">
            {filtered.map((sermon) => (
              <li key={sermon.id}>
                <button
                  onClick={() => onSelect(sermon)}
                  className={cn(
                    'w-full rounded-md px-3 py-2.5 text-left transition-colors',
                    selected?.id === sermon.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50 hover:text-accent-foreground'
                  )}
                >
                  <p className="truncate text-sm font-medium leading-snug">{sermon.title}</p>
                  {(sermon.date || sermon.location) && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {[sermon.date, sermon.location].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  )
}
