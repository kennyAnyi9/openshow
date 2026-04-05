import { useState } from 'react'
import { MapPin, Calendar, Tv2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ipc } from '@/ipc/bridge'
import { useAppStore } from '@/store/app-store'
import type { Sermon } from '../../../../main/db/schema'

interface SermonDetailProps {
  sermon: Sermon
}

// Split extracted text into projectable paragraphs
function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean)
}

export default function SermonDetail({ sermon }: SermonDetailProps): React.JSX.Element {
  const selectedOutputId = useAppStore((s) => s.selectedOutputId)
  const [projecting, setProjecting] = useState<string | null>(null)

  async function project(text: string): Promise<void> {
    if (!selectedOutputId) return
    setProjecting(text)
    await ipc.projectSlide(selectedOutputId, { text, background: '#000000' })
  }

  const chunks = sermon.extractedText ? paragraphs(sermon.extractedText) : []

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      {/* Sermon header */}
      <div className="shrink-0 border-b border-border px-6 py-5">
        <h1 className="text-lg font-semibold leading-tight">{sermon.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          {sermon.date && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar size={12} />
              {sermon.date}
            </span>
          )}
          {sermon.location && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin size={12} />
              {sermon.location}
            </span>
          )}
        </div>

        {/* Output status */}
        {selectedOutputId && (
          <div className="mt-3">
            <Badge variant="outline" className="gap-1.5 text-xs text-muted-foreground">
              <Tv2 size={10} />
              Output ready
            </Badge>
          </div>
        )}
      </div>

      {/* Text body */}
      <ScrollArea className="flex-1">
        {chunks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">No text extracted yet.</p>
            <p className="text-xs text-muted-foreground">
              PDF import coming in a future update.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {chunks.map((chunk, i) => (
              <div key={i} className="group flex items-start gap-3 px-6 py-3">
                <p className="flex-1 text-sm leading-relaxed text-foreground/90">{chunk}</p>
                {selectedOutputId && (
                  <button
                    onClick={() => project(chunk)}
                    className="mt-0.5 shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                  >
                    {projecting === chunk ? (
                      <Tv2 size={14} className="text-primary" />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer actions */}
      {chunks.length > 0 && selectedOutputId && (
        <>
          <Separator />
          <div className="flex shrink-0 items-center justify-end gap-2 px-6 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => ipc.clearOutput(selectedOutputId)}
            >
              Clear output
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
