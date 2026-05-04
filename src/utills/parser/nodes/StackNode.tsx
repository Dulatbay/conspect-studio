import React, { ReactNode, forwardRef, useState } from 'react'
import { BaseProps, Stack } from '../types'
import {
  getAlignItemsValue,
  getJustifyContent,
  getFlexWrap,
  getStylesFromBaseNode,
} from '../lib'
import { useSelectedNode } from '../../../context/hooks/context'
import {
  BLOCK_MIME,
  BLOCK_TEMPLATES,
  type BlockKind,
} from '../../../lib/nodeTemplates'

interface Props extends BaseProps {
  obj: Stack
  children: ReactNode
}

const StackNode = forwardRef<HTMLDivElement, Props>(
  ({ obj, children, onClick, isSelected }, ref) => {
    const { addNodeToStackById } = useSelectedNode()
    const [isOver, setIsOver] = useState(false)

    const style: React.CSSProperties = {
      display: 'flex',
      flexDirection: obj.vertical ? 'column' : 'row',
      minHeight: 40,
      ...getStylesFromBaseNode(obj),
      ...(obj.flexWrap && { flexWrap: getFlexWrap(obj.flexWrap) }),
      ...(obj.justifyContent && {
        justifyContent: getJustifyContent(obj.justifyContent),
      }),
      ...(obj.alignItems && { alignItems: getAlignItemsValue(obj.alignItems) }),
      ...(obj.gap && { gap: `${obj.gap}px` }),
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      if (!e.dataTransfer.types.includes(BLOCK_MIME)) return
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.dropEffect = 'copy'
      if (!isOver) setIsOver(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      if (e.currentTarget.contains(e.relatedTarget as Node)) return
      setIsOver(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      const kind = e.dataTransfer.getData(BLOCK_MIME) as BlockKind | ''
      if (!kind) return
      e.preventDefault()
      e.stopPropagation()
      const tpl = BLOCK_TEMPLATES.find((t) => t.kind === kind)
      if (!tpl) return
      addNodeToStackById(obj.id, tpl.build())
      setIsOver(false)
    }

    const borderClass = isSelected
      ? '!ring-2 !ring-brand-500'
      : isOver
      ? '!ring-2 !ring-accent-500'
      : 'ring-1 ring-transparent hover:ring-line/60'
    const bg = obj.cut ? '!opacity-40' : ''

    return (
      <div
        ref={ref}
        style={style}
        className={`relative rounded-md transition ${borderClass} ${bg}`}
        onClick={onClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {children}
        {isOver && (!obj.children || obj.children.length === 0) && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md border-2 border-dashed border-accent-500/60 bg-accent-500/5 text-xs font-medium text-accent-400">
            Drop here to add
          </div>
        )}
      </div>
    )
  }
)

StackNode.displayName = 'StackNode'

export default StackNode
