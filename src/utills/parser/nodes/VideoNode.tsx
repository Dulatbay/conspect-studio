import React, { forwardRef, useRef, useState } from 'react'
import { Play, Pause, VideoOff } from 'lucide-react'
import { BaseProps, Video } from '../types'
import { getStylesFromBaseNode } from '../lib'

interface Props extends BaseProps {
  obj: Video
}

const VideoNode = forwardRef<HTMLDivElement, Props>(
  ({ obj, onClick, isSelected }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(!!obj.autoplay)

    const wrapperStyle: React.CSSProperties = {
      ...getStylesFromBaseNode(obj),
    }

    const selection = isSelected
      ? 'ring-2 ring-brand-500'
      : 'ring-1 ring-transparent hover:ring-line/60'
    const cut = obj.cut ? 'opacity-40' : ''

    const togglePlay = (e: React.MouseEvent) => {
      e.stopPropagation()
      const v = videoRef.current
      if (!v) return
      if (v.paused) {
        void v.play()
        setIsPlaying(true)
      } else {
        v.pause()
        setIsPlaying(false)
      }
    }

    return (
      <div
        ref={ref}
        style={wrapperStyle}
        onClick={onClick}
        className={`group relative overflow-hidden rounded-md bg-black/40 transition ${selection} ${cut}`}
      >
        {obj.url ? (
          <>
            <video
              ref={videoRef}
              src={obj.url}
              poster={obj.poster}
              autoPlay={obj.autoplay}
              loop={obj.loop}
              muted={obj.muted ?? !!obj.autoplay}
              controls={obj.controls ?? false}
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="block h-auto w-full select-none"
            />
            {!obj.controls && (
              <button
                type="button"
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
                className={[
                  'absolute inset-0 flex items-center justify-center text-white transition',
                  isPlaying
                    ? 'bg-transparent opacity-0 group-hover:bg-black/30 group-hover:opacity-100'
                    : 'bg-black/30 opacity-100',
                ].join(' ')}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/20 transition group-hover:scale-105">
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </span>
              </button>
            )}
          </>
        ) : (
          <div className="flex h-40 w-64 items-center justify-center gap-2 text-xs text-ink-400">
            <VideoOff size={14} />
            No video url
          </div>
        )}
      </div>
    )
  }
)

VideoNode.displayName = 'VideoNode'

export default VideoNode
