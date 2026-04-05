import { useEffect } from 'react'
import { ipc } from './ipc/bridge'
import { useDataStore } from './store/data-store'
import { useAppStore } from './store/app-store'
import AppShell from './components/layout/AppShell'
import TableView from './views/TheTable/TableView'
import BibleView from './views/Bible/BibleView'

function ViewRouter(): React.JSX.Element {
  const view = useAppStore((s) => s.currentView)

  switch (view) {
    case 'table':
      return <TableView />
    case 'bible':
      return <BibleView />
    case 'hymns':
      return <Placeholder label="Hymns" />
    case 'editor':
      return <Placeholder label="Editor" />
    case 'media':
      return <Placeholder label="Settings" />
    default:
      return <Placeholder label="Coming soon" />
  }
}

function Placeholder({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-sm text-muted-foreground">{label} — coming soon</p>
    </div>
  )
}

function App(): React.JSX.Element {
  const { setShows, setSermons, setHymns, setBibleBooks } = useDataStore()

  useEffect(() => {
    async function hydrate(): Promise<void> {
      try {
        const [shows, sermons, hymns, bibleBooks] = await Promise.all([
          ipc.getShows(),
          ipc.getSermons(),
          ipc.getHymns(),
          ipc.getBibleBooks()
        ])

        if (shows.success) setShows(shows.data)
        else console.error('[hydrate] getShows failed:', shows.error)

        if (sermons.success) setSermons(sermons.data)
        else console.error('[hydrate] getSermons failed:', sermons.error)

        if (hymns.success) setHymns(hymns.data)
        else console.error('[hydrate] getHymns failed:', hymns.error)

        if (bibleBooks.success) setBibleBooks(bibleBooks.data)
        else console.error('[hydrate] getBibleBooks failed:', bibleBooks.error)
      } catch (e) {
        console.error('[hydrate] IPC call threw unexpectedly:', e)
      }
    }

    hydrate()
  }, [setShows, setSermons, setHymns, setBibleBooks])

  return (
    <AppShell>
      <ViewRouter />
    </AppShell>
  )
}

export default App
