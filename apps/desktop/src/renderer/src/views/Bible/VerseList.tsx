import { useState, useEffect } from 'react'
import { Tv2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ipc } from '@/ipc/bridge'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'
import type { BibleBook, BibleVerse } from '../../../../main/db/schema'

interface VerseListProps {
  book: BibleBook
  chapter: number
}

export default function VerseList({ book, chapter }: VerseListProps): React.JSX.Element {
  const [verses, setVerses] = useState<BibleVerse[]>([])
  const [loading, setLoading] = useState(false)
  const [projecting, setProjecting] = useState<number | null>(null)
  const selectedOutputId = useAppStore((s) => s.selectedOutputId)

  useEffect(() => {
    setLoading(true)
    setVerses([])
    ipc.getBibleVerses(book.id, chapter).then((result) => {
      if (result.success) setVerses(result.data)
      setLoading(false)
    })
  }, [book.id, chapter])

  async function project(verse: BibleVerse): Promise<void> {
    if (!selectedOutputId) return
    setProjecting(verse.verse)
    const text = `${book.name} ${chapter}:${verse.verse}\n\n${verse.text}`
    await ipc.projectSlide(selectedOutputId, { text, background: '#000000' })
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      {/* Chapter header */}
      <div className="shrink-0 border-b border-border px-5 py-3">
        <p className="text-sm font-semibold">
          {book.name} <span className="text-muted-foreground font-normal">Chapter {chapter}</span>
        </p>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {verses.map((v) => (
              <div
                key={v.verse}
                className="group flex items-start gap-3 px-5 py-3 hover:bg-accent/30"
              >
                {/* Verse number */}
                <span className="mt-0.5 w-6 shrink-0 text-right text-xs font-semibold text-muted-foreground/60">
                  {v.verse}
                </span>
                {/* Verse text */}
                <p className="flex-1 text-sm leading-relaxed text-foreground/90">{v.text}</p>
                {/* Project button */}
                {selectedOutputId && (
                  <button
                    onClick={() => project(v)}
                    className={cn(
                      'mt-0.5 shrink-0 rounded p-1 opacity-0 transition-all group-hover:opacity-100',
                      projecting === v.verse
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Tv2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
