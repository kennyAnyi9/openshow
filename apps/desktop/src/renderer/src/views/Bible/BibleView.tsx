import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ipc } from '@/ipc/bridge'
import { useDataStore } from '@/store/data-store'
import { useAppStore } from '@/store/app-store'
import { chapterCount } from './kjv-chapters'
import SlidePreviewPanel, { type SlideItem } from '@/components/SlidePreviewPanel'
import SectionTabBar from '@/components/SectionTabBar'
import MediaPanel from '@/components/MediaPanel'
import type { BibleBook, BibleVerse } from '../../../../main/db/schema'

export default function BibleView(): React.JSX.Element {
  const books = useDataStore((s) => s.bibleBooks)
  const [query, setQuery] = useState('')
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [verses, setVerses] = useState<BibleVerse[]>([])
  const [loading, setLoading] = useState(false)

  const ot = books.filter((b) => b.testament === 'OT')
  const nt = books.filter((b) => b.testament === 'NT')

  const filteredOt = query.trim()
    ? ot.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))
    : ot
  const filteredNt = query.trim()
    ? nt.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))
    : nt

  useEffect(() => {
    if (!selectedBook || !selectedChapter) {
      setVerses([])
      return
    }
    setLoading(true)
    ipc.getBibleVerses(selectedBook.id, selectedChapter).then((result) => {
      if (result.success) setVerses(result.data)
      setLoading(false)
    })
  }, [selectedBook?.id, selectedChapter])

  function handleBookSelect(book: BibleBook): void {
    setSelectedBook(book)
    setSelectedChapter(null)
    setVerses([])
    useAppStore.getState().setActiveSlideIndex(0)
  }

  function handleChapterSelect(ch: number): void {
    setSelectedChapter(ch)
    useAppStore.getState().setActiveSlideIndex(0)
  }

  const totalChapters = selectedBook ? chapterCount(selectedBook.id) : 0

  const chapterSections = useMemo(() => {
    if (!selectedBook) return []
    const count = chapterCount(selectedBook.id)
    return Array.from({ length: count }, (_, i) => ({
      key: String(i + 1),
      label: String(i + 1)
    }))
  }, [selectedBook?.id])

  const slides: SlideItem[] = useMemo(
    () =>
      verses.map((v) => ({
        key: String(v.verse),
        label: `Verse ${v.verse}`,
        preview: v.text.slice(0, 80),
        slidePayload: {
          text: `${selectedBook?.name} ${selectedChapter}:${v.verse}\n\n${v.text}`,
          background: '#000000'
        }
      })),
    [verses, selectedBook?.name, selectedChapter]
  )

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left: book/chapter navigation */}
      <aside className="flex h-full w-80 shrink-0 flex-col border-r border-border">
        {!selectedBook ? (
          <>
            {/* Book list mode */}
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
                <div className="px-2 pb-2">
                  <BookGroup label="Old Testament" books={filteredOt} onSelect={handleBookSelect} />
                  <BookGroup label="New Testament" books={filteredNt} onSelect={handleBookSelect} />
                </div>
              </ScrollArea>
            </div>
          </>
        ) : (
          <>
            {/* Chapter selection mode */}
            <div className="flex items-center gap-2 border-b border-border px-3 py-3">
              <button
                onClick={() => {
                  setSelectedBook(null)
                  setSelectedChapter(null)
                  setQuery('')
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-live">{selectedBook.name}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-4 gap-1 p-2">
                  {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => handleChapterSelect(ch)}
                      className={cn(
                        'rounded py-2 text-sm font-medium transition-colors',
                        selectedChapter === ch
                          ? 'text-live'
                          : 'text-muted-foreground hover:text-foreground/70'
                      )}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </aside>

      {/* Center: verse content */}
      <main className="flex h-full flex-1 flex-col overflow-hidden">
        {selectedBook && selectedChapter ? (
          <>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="px-8 py-6">
                  {loading ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">Loading…</p>
                  ) : (
                    verses.map((v) => (
                      <div key={v.verse} className="mb-1 flex items-start gap-3">
                        <span className="mt-0.5 w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                          {v.verse}
                        </span>
                        <p className="text-sm leading-relaxed text-foreground/70">{v.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {chapterSections.length > 0 && (
              <SectionTabBar
                sections={chapterSections}
                activeKey={String(selectedChapter)}
                onSelect={(key) => handleChapterSelect(Number(key))}
              />
            )}

            <MediaPanel />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {selectedBook ? 'Select a chapter' : 'Select a book'}
            </p>
          </div>
        )}
      </main>

      {/* Right: slide preview */}
      {selectedBook && selectedChapter && verses.length > 0 ? (
        <SlidePreviewPanel
          titleCard={{
            label: selectedBook.name,
            sublabel: `Chapter ${selectedChapter}`
          }}
          slides={slides}
        />
      ) : (
        <aside className="w-72 shrink-0 border-l border-border" />
      )}
    </div>
  )
}

function BookGroup({
  label,
  books,
  onSelect
}: {
  label: string
  books: BibleBook[]
  onSelect: (b: BibleBook) => void
}): React.JSX.Element {
  if (books.length === 0) return <></>
  return (
    <div className="mb-2">
      <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {books.map((book) => (
        <button
          key={book.id}
          onClick={() => onSelect(book)}
          className="w-full rounded px-3 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:text-foreground/70"
        >
          {book.name}
        </button>
      ))}
    </div>
  )
}
