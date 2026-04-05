import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { BibleBook } from '../../../../main/db/schema'

interface ChapterGridProps {
  book: BibleBook
  chapterCount: number
  selectedChapter: number | null
  onSelect: (chapter: number) => void
}

export default function ChapterGrid({
  book,
  chapterCount,
  selectedChapter,
  onSelect
}: ChapterGridProps): React.JSX.Element {
  return (
    <div className="flex h-full w-36 shrink-0 flex-col border-r border-border">
      <div className="border-b border-border px-3 py-3">
        <p className="truncate text-xs font-semibold text-foreground">{book.name}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{chapterCount} chapters</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-3 gap-1 p-2">
          {Array.from({ length: chapterCount }, (_, i) => i + 1).map((ch) => (
            <button
              key={ch}
              onClick={() => onSelect(ch)}
              className={cn(
                'rounded py-2 text-sm font-medium transition-colors',
                selectedChapter === ch
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground/70 hover:bg-accent/50 hover:text-accent-foreground'
              )}
            >
              {ch}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
