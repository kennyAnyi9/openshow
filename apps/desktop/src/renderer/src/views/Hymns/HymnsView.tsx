import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useDataStore } from '@/store/data-store'
import { useAppStore } from '@/store/app-store'
import SlidePreviewPanel, { type SlideItem } from '@/components/SlidePreviewPanel'
import SectionTabBar from '@/components/SectionTabBar'
import MediaPanel from '@/components/MediaPanel'
import type { Hymn } from '../../../../main/db/schema'


export default function HymnsView(): React.JSX.Element {
  const hymns = useDataStore((s) => s.hymns)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Hymn | null>(null)
  const [activeSectionKey, setActiveSectionKey] = useState<string | null>(null)

  const filtered = query.trim()
    ? hymns.filter((h) => h.title.toLowerCase().includes(query.toLowerCase()))
    : hymns

  const verses = selected?.verses ?? []

  const sections = useMemo(
    () => verses.map((v) => ({ key: v.label, label: v.label })),
    [verses]
  )

  const slides: SlideItem[] = useMemo(
    () =>
      verses.map((v) => ({
        key: v.label,
        label: v.label,
        preview: v.lines.slice(0, 2).join('\n'),
        slidePayload: { text: v.lines.join('\n'), background: '#000000' }
      })),
    [verses]
  )

  function scrollToSection(key: string): void {
    setActiveSectionKey(key)
    document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth' })
  }

  function padNumber(n: number): string {
    return String(n).padStart(4, '0')
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left: hymn list */}
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
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">No matches</p>
            ) : (
              <ul className="px-2 pb-2">
                {filtered.map((hymn, idx) => (
                  <li key={hymn.id}>
                    <button
                      onClick={() => {
                        setSelected(hymn)
                        setActiveSectionKey(null)
                        useAppStore.getState().setActiveSlideIndex(0)
                      }}
                      className={cn(
                        'flex w-full items-baseline gap-2 rounded-md px-3 py-2 text-left transition-colors',
                        selected?.id === hymn.id
                          ? 'text-live'
                          : 'text-muted-foreground hover:text-foreground/70'
                      )}
                    >
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {padNumber(idx + 1)}
                      </span>
                      <span
                        className={cn(
                          'truncate text-sm font-medium',
                          selected?.id === hymn.id ? 'text-live' : ''
                        )}
                      >
                        {hymn.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>
      </aside>

      {/* Center: content */}
      <main className="flex h-full flex-1 flex-col overflow-hidden">
        {selected ? (
          <>
            {/* Stanza content */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="px-8 py-6">
                  {verses.map((verse) => (
                    <div key={verse.label} id={`section-${verse.label}`} className="mb-8">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {verse.label}
                      </p>
                      {verse.lines.map((line, i) => (
                        <p key={i} className="text-sm leading-relaxed text-foreground/70">
                          {line || <br />}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Section tab bar — sits below content */}
            {sections.length > 0 && (
              <SectionTabBar
                sections={sections}
                activeKey={activeSectionKey}
                onSelect={scrollToSection}
              />
            )}

            <MediaPanel />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">Select a hymn</p>
          </div>
        )}
      </main>

      {/* Right: slide preview */}
      {selected ? (
        <SlidePreviewPanel
          titleCard={{
            label: `HYMN ${padNumber(filtered.indexOf(selected) + 1)}`,
            sublabel: selected.title
          }}
          slides={slides}
        />
      ) : (
        <aside className="w-72 shrink-0 border-l border-border" />
      )}
    </div>
  )
}
