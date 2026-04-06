import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ipc } from '@/ipc/bridge'
import { useAppStore } from '@/store/app-store'
import type { SlidePayload } from '../../../types/ipc'

export interface SlideItem {
  key: string
  label: string
  preview: string
  slidePayload: SlidePayload
}

interface SlidePreviewPanelProps {
  titleCard: { label: string; sublabel?: string }
  slides: SlideItem[]
}

export default function SlidePreviewPanel({
  titleCard,
  slides
}: SlidePreviewPanelProps): React.JSX.Element {
  const activeSlideIndex = useAppStore((s) => s.activeSlideIndex)
  const setActiveSlideIndex = useAppStore((s) => s.setActiveSlideIndex)
  const selectedOutputId = useAppStore((s) => s.selectedOutputId)

  async function projectSlide(index: number, payload: SlidePayload): Promise<void> {
    setActiveSlideIndex(index)
    useAppStore.getState().setCurrentSlide(payload)
    if (selectedOutputId) {
      await ipc.projectSlide(selectedOutputId, payload)
    }
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-border">
      <ScrollArea className="h-full">
        <div className="space-y-2 p-3">
          {/* Title card */}
          <button
            onClick={() =>
              projectSlide(-1, {
                text: titleCard.sublabel
                  ? `${titleCard.label}\n${titleCard.sublabel}`
                  : titleCard.label,
                background: '#000000'
              })
            }
            className={cn(
              'flex aspect-video w-full flex-col items-center justify-center rounded-md border p-3 text-center transition-colors',
              activeSlideIndex === -1 && selectedOutputId
                ? 'border-live'
                : 'border-border'
            )}
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {titleCard.label}
            </p>
            {titleCard.sublabel && (
              <p className="mt-1 text-xs text-muted-foreground">{titleCard.sublabel}</p>
            )}
          </button>

          {/* Slide cards */}
          {slides.map((slide, index) => (
            <button
              key={slide.key}
              onClick={() => projectSlide(index, slide.slidePayload)}
              className={cn(
                'flex aspect-video w-full flex-col items-center justify-center rounded-md border p-3 text-center transition-colors',
                activeSlideIndex === index && selectedOutputId
                  ? 'border-live'
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {slide.label}
              </p>
              <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground/70">
                {slide.preview}
              </p>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
