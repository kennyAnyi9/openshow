import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

// ─── Shows ───────────────────────────────────────────────────────────────────

export const shows = sqliteTable('shows', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category'),
  meta: text('meta', { mode: 'json' }).$type<{
    title?: string
    author?: string
    copyright?: string
    CCLI?: string
    key?: string
    year?: string
  }>(),
  timestamps: text('timestamps', { mode: 'json' }).$type<{
    created: number
    modified: number | null
    used: number | null
  }>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const slides = sqliteTable(
  'slides',
  {
    id: text('id').primaryKey(),
    showId: text('show_id')
      .notNull()
      .references(() => shows.id, { onDelete: 'cascade' }),
    groupName: text('group_name'),
    globalGroup: text('global_group'),
    color: text('color'),
    notes: text('notes').default(''),
    items: text('items', { mode: 'json' }).$type<unknown[]>().default([]),
    orderIndex: integer('order_index').notNull().default(0)
  },
  (t) => [index('slides_show_id_idx').on(t.showId)]
)

export const layouts = sqliteTable(
  'layouts',
  {
    id: text('id').primaryKey(),
    showId: text('show_id')
      .notNull()
      .references(() => shows.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slideOrder: text('slide_order', { mode: 'json' }).$type<string[]>().default([])
  },
  (t) => [index('layouts_show_id_idx').on(t.showId)]
)

// ─── Sermons (The Table) ─────────────────────────────────────────────────────

export const sermons = sqliteTable('sermons', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  date: text('date'),
  location: text('location'),
  pdfPath: text('pdf_path'),
  extractedText: text('extracted_text'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

// ─── Hymns ───────────────────────────────────────────────────────────────────

export const hymns = sqliteTable('hymns', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author'),
  verses: text('verses', { mode: 'json' }).$type<
    { label: string; lines: string[] }[]
  >().default([])
})

// ─── Bible ───────────────────────────────────────────────────────────────────

export const bibleBooks = sqliteTable('bible_books', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  abbreviation: text('abbreviation').notNull(),
  testament: text('testament', { enum: ['OT', 'NT'] }).notNull()
})

export const bibleVerses = sqliteTable(
  'bible_verses',
  {
    id: integer('id').primaryKey(),
    bookId: integer('book_id')
      .notNull()
      .references(() => bibleBooks.id),
    chapter: integer('chapter').notNull(),
    verse: integer('verse').notNull(),
    text: text('text').notNull()
  },
  (t) => [
    index('bible_verses_book_chapter_idx').on(t.bookId, t.chapter),
    index('bible_verses_lookup_idx').on(t.bookId, t.chapter, t.verse)
  ]
)

// ─── Projects ────────────────────────────────────────────────────────────────

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  items: text('items', { mode: 'json' }).$type<
    { type: 'show' | 'sermon' | 'hymn'; id: string }[]
  >().default([]),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

// ─── Settings ────────────────────────────────────────────────────────────────

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).$type<unknown>()
})

// ─── Outputs ─────────────────────────────────────────────────────────────────

export const outputs = sqliteTable('outputs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(false),
  bounds: text('bounds', { mode: 'json' }).$type<{
    x: number
    y: number
    width: number
    height: number
  }>(),
  config: text('config', { mode: 'json' }).$type<Record<string, unknown>>().default({})
})

// ─── Inferred types ───────────────────────────────────────────────────────────

export type Show = typeof shows.$inferSelect
export type NewShow = typeof shows.$inferInsert
export type Slide = typeof slides.$inferSelect
export type Sermon = typeof sermons.$inferSelect
export type NewSermon = typeof sermons.$inferInsert
export type Hymn = typeof hymns.$inferSelect
export type BibleBook = typeof bibleBooks.$inferSelect
export type BibleVerse = typeof bibleVerses.$inferSelect
export type Project = typeof projects.$inferSelect
export type Output = typeof outputs.$inferSelect
