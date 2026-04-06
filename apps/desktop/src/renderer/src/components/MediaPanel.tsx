import { useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ipc } from '@/ipc/bridge'
import { useDataStore } from '@/store/data-store'
import { useAppStore } from '@/store/app-store'
import { mediaUrl } from '../../../types/ipc'
import type { MediaItem } from '../../../main/db/schema'

export default function MediaPanel(): React.JSX.Element {
  const mediaItems = useDataStore((s) => s.mediaItems)
  const mediaLoaded = useDataStore((s) => s.mediaLoaded)
  const setMediaItems = useDataStore((s) => s.setMediaItems)
  const addMediaItemToStore = useDataStore((s) => s.addMediaItemToStore)
  const removeMediaItemFromStore = useDataStore((s) => s.removeMediaItemFromStore)

  useEffect(() => {
    if (mediaLoaded) return
    ipc.getMediaItems().then((result) => {
      if (result.success) setMediaItems(result.data)
    })
  }, [mediaLoaded, setMediaItems])

  async function handleAdd(): Promise<void> {
    const result = await ipc.openFileDialog([
      { name: 'Media', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov'] }
    ])
    if (!result.success || !result.data) return

    const added = await ipc.addMediaItem(result.data)
    if (added.success) addMediaItemToStore(added.data)
  }

  async function handleDelete(id: string): Promise<void> {
    const result = await ipc.deleteMediaItem(id)
    if (result.success) removeMediaItemFromStore(id)
  }

  function handleProject(item: MediaItem): void {
    const currentSlide = useAppStore.getState().currentSlide
    const selectedOutputId = useAppStore.getState().selectedOutputId
    if (!selectedOutputId) return

    const bgMedia = { url: mediaUrl(item.path), type: item.type as 'image' | 'video' }

    if (currentSlide?.text) {
      const slide = { ...currentSlide, backgroundMedia: bgMedia, overlay: true }
      useAppStore.getState().setCurrentSlide(slide)
      ipc.projectSlide(selectedOutputId, slide)
    } else {
      const slide = { backgroundMedia: bgMedia, overlay: false }
      useAppStore.getState().setCurrentSlide(slide)
      ipc.projectSlide(selectedOutputId, slide)
    }
  }

  return (
    <div className="flex h-64 shrink-0 flex-col border-t border-border">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Media
        </p>
        <button
          onClick={handleAdd}
          className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus size={14} />
        </button>
      </div>

      <ScrollArea className="flex-1 px-3 pb-3">
        <div className="flex gap-2">
          {mediaItems.map((item) => (
            <div key={item.id} className="group relative shrink-0">
              {item.type === 'image' ? (
                <button
                  onClick={() => handleProject(item)}
                  className="block h-28 w-40 overflow-hidden rounded-md border border-border transition-colors hover:border-muted-foreground/30"
                >
                  <img
                    src={mediaUrl(item.path)}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ) : (
                <button
                  onClick={() => handleProject(item)}
                  className="flex h-28 w-40 flex-col items-center justify-center rounded-md border border-border bg-muted/30 transition-colors hover:border-muted-foreground/30"
                >
                  <p className="text-xs text-muted-foreground">Video</p>
                  <p className="mt-1 max-w-[90%] truncate text-[10px] text-muted-foreground/70">
                    {item.name}
                  </p>
                </button>
              )}
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute right-1 top-1 hidden rounded bg-background/80 p-1 text-muted-foreground transition-colors hover:text-destructive group-hover:block"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {mediaItems.length === 0 && (
            <div className="flex h-28 w-full items-center justify-center">
              <p className="text-xs text-muted-foreground">No media added</p>
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
