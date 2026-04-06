import { useEffect } from 'react'
import { ipc } from './ipc/bridge'
import { useDataStore } from './store/data-store'
import { useAppStore } from './store/app-store'
import AppShell from './components/layout/AppShell'
import TableView from './views/TheTable/TableView'
import BibleView from './views/Bible/BibleView'
import HymnsView from './views/Hymns/HymnsView'

function ViewRouter(): React.JSX.Element {
  const view = useAppStore((s) => s.currentView)

  switch (view) {
    case 'hymns':
      return <HymnsView />
    case 'table':
      return <TableView />
    case 'bible':
      return <BibleView />
  }
}

function App(): React.JSX.Element {
  const { setShows, setSermons, setHymns, setBibleBooks, setMediaItems } = useDataStore()

  useEffect(() => {
    async function hydrate(): Promise<void> {
      try {
        const [shows, sermons, hymns, bibleBooks, mediaItems] = await Promise.all([
          ipc.getShows(),
          ipc.getSermons(),
          ipc.getHymns(),
          ipc.getBibleBooks(),
          ipc.getMediaItems()
        ])

        if (shows.success) setShows(shows.data)
        else console.error('[hydrate] getShows failed:', shows.error)

        if (sermons.success) setSermons(sermons.data)
        else console.error('[hydrate] getSermons failed:', sermons.error)

        if (hymns.success) setHymns(hymns.data)
        else console.error('[hydrate] getHymns failed:', hymns.error)

        if (bibleBooks.success) setBibleBooks(bibleBooks.data)
        else console.error('[hydrate] getBibleBooks failed:', bibleBooks.error)

        if (mediaItems.success) setMediaItems(mediaItems.data)
        else console.error('[hydrate] getMediaItems failed:', mediaItems.error)
      } catch (e) {
        console.error('[hydrate] IPC call threw unexpectedly:', e)
      }
    }

    hydrate()
  }, [setShows, setSermons, setHymns, setBibleBooks, setMediaItems])

  return (
    <AppShell>
      <ViewRouter />
    </AppShell>
  )
}

export default App
