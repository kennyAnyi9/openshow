import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useDataStore } from '@/store/data-store'
import { useAppStore } from '@/store/app-store'
import SlidePreviewPanel, { type SlideItem } from '@/components/SlidePreviewPanel'
import type { Sermon } from '../../../../main/db/schema'

function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean)
}

export default function TableView(): React.JSX.Element {
  const sermons = useDataStore((s) => s.sermons)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Sermon | null>(null)

  const filtered = query.trim()
    ? sermons.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          (s.date ?? '').includes(query) ||
          (s.location ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : sermons

  const chunks = selected?.extractedText ? paragraphs(selected.extractedText) : []

  const slides: SlideItem[] = useMemo(
    () =>
      chunks.map((chunk, i) => ({
        key: String(i),
        label: `Paragraph ${i + 1}`,
        preview: chunk.slice(0, 80),
        slidePayload: { text: chunk, background: '#000000' }
      })),
    [chunks]
  )

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left: sermon list */}
      <aside className="flex h-full w-80 shrink-0 flex-col border-r border-border">
        <div className="px-3 py-3">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {sermons.length === 0 ? 'No sermons imported' : 'No matches'}
                </p>
                {sermons.length === 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    PDF import will be available in an upcoming update.
                  </p>
                )}
              </div>
            ) : (
              <ul className="px-2 pb-2">
                {filtered.map((sermon) => (
                  <li key={sermon.id}>
                    <button
                      onClick={() => {
                        setSelected(sermon)
                        useAppStore.getState().setActiveSlideIndex(0)
                      }}
                      className={cn(
                        'w-full rounded-md px-3 py-2 text-left transition-colors',
                        selected?.id === sermon.id
                          ? 'text-live'
                          : 'text-muted-foreground hover:text-foreground/70'
                      )}
                    >
                      <p className={cn(
                        'truncate text-sm font-medium',
                        selected?.id === sermon.id ? 'text-live' : ''
                      )}>
                        {sermon.title}
                      </p>
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
      </aside>

      {/* Center: sermon content */}
      <main className="flex h-full flex-1 flex-col overflow-hidden">
        {selected ? (
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="px-8 py-6">
                {chunks.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">
                    No text extracted yet.
                  </p>
                ) : (
                  chunks.map((chunk, i) => (
                    <p key={i} className="mb-4 text-sm leading-relaxed text-foreground/70">
                      {chunk}
                    </p>
                  ))
                )}
              </div>
              <div className="h-24" />
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">Select a sermon</p>
          </div>
        )}
      </main>

      {/* Right: slide preview */}
      {selected && chunks.length > 0 ? (
        <SlidePreviewPanel
          titleCard={{ label: selected.title }}
          slides={slides}
        />
      ) : (
        <aside className="w-72 shrink-0 border-l border-border" />
      )}
    </div>
  )
}
