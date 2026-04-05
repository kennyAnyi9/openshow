import { useState } from 'react'
import { BookText } from 'lucide-react'
import SermonList from './SermonList'
import SermonDetail from './SermonDetail'
import { useDataStore } from '@/store/data-store'
import type { Sermon } from '../../../../main/db/schema'

export default function TableView(): React.JSX.Element {
  const sermons = useDataStore((s) => s.sermons)
  const sermonsLoaded = useDataStore((s) => s.sermonsLoaded)
  const [selected, setSelected] = useState<Sermon | null>(null)

  return (
    <div className="flex h-full w-full overflow-hidden">
      <SermonList
        sermons={sermons}
        selected={selected}
        onSelect={setSelected}
      />

      {/* Detail panel */}
      <div className="flex flex-1 overflow-hidden">
        {!sermonsLoaded ? (
          <EmptyPane message="Loading…" />
        ) : selected ? (
          <SermonDetail sermon={selected} />
        ) : sermons.length === 0 ? (
          <EmptyState />
        ) : (
          <EmptyPane message="Select a sermon" />
        )}
      </div>
    </div>
  )
}

function EmptyPane({ message }: { message: string }): React.JSX.Element {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

function EmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
        <BookText size={22} className="text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-medium">No sermons imported</p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF import will be available in an upcoming update.
        </p>
      </div>
    </div>
  )
}
