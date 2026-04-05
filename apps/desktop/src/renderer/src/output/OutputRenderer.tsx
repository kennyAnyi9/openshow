import { useEffect, useState } from 'react'
import { FromMain } from '../../../types/ipc'
import type { SlidePayload } from '../../../types/ipc'

export default function OutputRenderer(): React.JSX.Element {
  const [slide, setSlide] = useState<SlidePayload | null>(null)

  useEffect(() => {
    const unsubUpdate = window.api.on(FromMain.SLIDE_UPDATE, (payload) => {
      setSlide(payload)
    })
    const unsubClear = window.api.on(FromMain.SLIDE_CLEAR, () => {
      setSlide(null)
    })
    return () => {
      unsubUpdate()
      unsubClear()
    }
  }, [])

  if (!slide) {
    return <div style={{ width: '100%', height: '100%', background: '#000' }} />
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: slide.background ?? '#000'
      }}
    >
      {/* Text layer */}
      {slide.text && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5%',
            color: '#fff',
            fontSize: '5vw',
            fontWeight: 600,
            textAlign: 'center',
            lineHeight: 1.3,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {slide.text}
        </div>
      )}
    </div>
  )
}
