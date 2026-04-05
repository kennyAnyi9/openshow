import { useEffect } from 'react'
import { ipc } from './ipc/bridge'
import { useDataStore } from './store/data-store'

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
    <div className="app">
      <h1>OpenShow</h1>
      <p>Stores hydrated. Ready to build views.</p>
    </div>
  )
}

export default App
