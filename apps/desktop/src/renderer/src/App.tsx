import { useEffect } from 'react'
import { ipc } from './ipc/bridge'
import { useDataStore } from './store/data-store'

function App(): React.JSX.Element {
  const { setShows, setSermons, setHymns, setBibleBooks } = useDataStore()

  useEffect(() => {
    async function hydrate(): Promise<void> {
      const [shows, sermons, hymns, bibleBooks] = await Promise.all([
        ipc.getShows(),
        ipc.getSermons(),
        ipc.getHymns(),
        ipc.getBibleBooks()
      ])

      if (shows.success) setShows(shows.data)
      if (sermons.success) setSermons(sermons.data)
      if (hymns.success) setHymns(hymns.data)
      if (bibleBooks.success) setBibleBooks(bibleBooks.data)
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
