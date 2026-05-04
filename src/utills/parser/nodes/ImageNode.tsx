import React, { forwardRef } from 'react'
import { ImageOff } from 'lucide-react'
import { BaseProps, Image } from '../types'
import { getStylesFromBaseNode } from '../lib'

interface Props extends BaseProps {
  obj: Image
}

const ImageNode = forwardRef<HTMLDivElement, Props>(
  ({ obj, onClick, isSelected }, ref) => {
    const wrapperStyle: React.CSSProperties = {
      ...getStylesFromBaseNode(obj),
    }

    const selection = isSelected
      ? 'ring-2 ring-brand-500'
      : 'ring-1 ring-transparent hover:ring-line/60'
    const cut = obj.cut ? 'opacity-40' : ''

    return (
      <div
        ref={ref}
        style={wrapperStyle}
        onClick={onClick}
        className={`relative inline-flex max-w-full overflow-hidden rounded-md transition ${selection} ${cut}`}
      >
        {obj.url ? (
          <img
            src={obj.url}
            alt={obj.alt ?? ''}
            draggable={false}
            className="block h-auto w-full select-none object-contain"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.visibility = 'hidden'
            }}
          />
        ) : (
          <div className="flex h-32 w-48 items-center justify-center gap-2 bg-bg-elevated text-xs text-ink-400">
            <ImageOff size={14} />
            No image url
          </div>
        )}
      </div>
    )
  }
)

ImageNode.displayName = 'ImageNode'

export default ImageNode
