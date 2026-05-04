import React, { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { BaseProps, CenteredContainer } from '../types'
import { getStylesFromBaseNode } from '../lib'
import { Parser } from '../Parser.tsx'

interface Props extends BaseProps {
  obj: CenteredContainer
}

const CenteredContainerNode = forwardRef<HTMLDivElement, Props>(
  ({ obj, onClick, isSelected }, ref) => {
    const [flipped, setFlipped] = useState(false)
    const isFlippable = !!obj.flippable && !!obj.backChildNode

    const baseStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      ...getStylesFromBaseNode(obj),
      minHeight: 40,
    }

    const selection = isSelected
      ? 'ring-2 ring-brand-500 ring-offset-1 ring-offset-transparent'
      : 'ring-1 ring-transparent hover:ring-line'
    const cut = obj.cut ? 'opacity-40' : ''

    const handleClick = (e: React.MouseEvent) => {
      onClick?.(e)
      if (isFlippable) {
        e.stopPropagation()
        setFlipped((v) => !v)
      }
    }

    if (!isFlippable) {
      return (
        <div
          ref={ref}
          style={baseStyle}
          onClick={onClick}
          className={`rounded-md p-3 transition ${selection} ${cut}`}
        >
          {Parser({ obj: obj.childNode })}
        </div>
      )
    }

    const { width, height, minHeight, minWidth, alignSelf, ...flipBgStyle } = baseStyle

    return (
      <div
        ref={ref}
        style={{ width, height, minHeight, minWidth, alignSelf, perspective: 1200 }}
        className={`relative cursor-pointer rounded-md transition ${selection} ${cut}`}
        onClick={handleClick}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: '100%' }}
          className="rounded-md"
        >
          <div
            style={{
              ...flipBgStyle,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 80,
            }}
            className="rounded-md p-3"
          >
            {Parser({ obj: obj.childNode })}
          </div>
          <div
            style={{
              ...flipBgStyle,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              position: 'absolute',
              inset: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            className="rounded-md p-3"
          >
            {Parser({ obj: obj.backChildNode! })}
          </div>
        </motion.div>
        <span className="pointer-events-none absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-bg-surface/80 px-1.5 py-0.5 text-[10px] text-ink-300 backdrop-blur ring-1 ring-line">
          <RefreshCw size={9} />
          flip
        </span>
      </div>
    )
  }
)

CenteredContainerNode.displayName = 'CenteredContainerNode'

export default CenteredContainerNode
