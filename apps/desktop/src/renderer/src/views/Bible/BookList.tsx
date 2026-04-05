import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { BibleBook } from '../../../../main/db/schema'

interface BookListProps {
  books: BibleBook[]
  selectedBook: BibleBook | null
  onSelect: (book: BibleBook) => void
}

export default function BookList({ books, selectedBook, onSelect }: BookListProps): React.JSX.Element {
  const ot = books.filter((b) => b.testament === 'OT')
  const nt = books.filter((b) => b.testament === 'NT')

  return (
    <div className="flex h-full w-48 shrink-0 flex-col border-r border-border">
      <div className="flex items-center border-b border-border px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Bible
        </span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          <BookGroup label="Old Testament" books={ot} selected={selectedBook} onSelect={onSelect} />
          <BookGroup label="New Testament" books={nt} selected={selectedBook} onSelect={onSelect} />
        </div>
      </ScrollArea>
    </div>
  )
}

function BookGroup({
  label,
  books,
  selected,
  onSelect
}: {
  label: string
  books: BibleBook[]
  selected: BibleBook | null
  onSelect: (b: BibleBook) => void
}): React.JSX.Element {
  return (
    <div className="mb-2">
      <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {label}
      </p>
      {books.map((book) => (
        <button
          key={book.id}
          onClick={() => onSelect(book)}
          className={cn(
            'w-full rounded px-2 py-1.5 text-left text-sm transition-colors',
            selected?.id === book.id
              ? 'bg-accent text-accent-foreground'
              : 'text-foreground/80 hover:bg-accent/50 hover:text-accent-foreground'
          )}
        >
          {book.name}
        </button>
      ))}
    </div>
  )
}
