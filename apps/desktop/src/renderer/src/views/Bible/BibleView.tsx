import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import BookList from './BookList'
import ChapterGrid from './ChapterGrid'
import VerseList from './VerseList'
import { chapterCount } from './kjv-chapters'
import { useDataStore } from '@/store/data-store'
import type { BibleBook } from '../../../../main/db/schema'

export default function BibleView(): React.JSX.Element {
  const books = useDataStore((s) => s.bibleBooks)
  const booksLoaded = useDataStore((s) => s.bibleBooksLoaded)
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)

  function handleBookSelect(book: BibleBook): void {
    setSelectedBook(book)
    setSelectedChapter(null)
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Book list */}
      <BookList books={books} selectedBook={selectedBook} onSelect={handleBookSelect} />

      {/* Chapter grid — only when a book is selected */}
      {selectedBook && (
        <ChapterGrid
          book={selectedBook}
          chapterCount={chapterCount(selectedBook.id)}
          selectedChapter={selectedChapter}
          onSelect={setSelectedChapter}
        />
      )}

      {/* Verse list or empty states */}
      <div className="flex flex-1 overflow-hidden">
        {!booksLoaded ? (
          <Hint message="Loading…" />
        ) : !selectedBook ? (
          <EmptyState />
        ) : !selectedChapter ? (
          <Hint message="Select a chapter" />
        ) : (
          <VerseList book={selectedBook} chapter={selectedChapter} />
        )}
      </div>
    </div>
  )
}

function Hint({ message }: { message: string }): React.JSX.Element {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

function EmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
        <BookOpen size={22} className="text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-medium">KJV Bible</p>
        <p className="mt-1 text-xs text-muted-foreground">Select a book to begin</p>
      </div>
    </div>
  )
}
