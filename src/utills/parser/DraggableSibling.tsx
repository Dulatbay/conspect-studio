import React, { useState } from 'react'
import { useSelectedNode } from '../../context/hooks/context'
import {
  BLOCK_MIME,
  BLOCK_TEMPLATES,
  type BlockKind,
} from '../../lib/nodeTemplates'

interface Props {
  childId: string
  parentId: string
  vertical: boolean
  children: React.ReactNode
}

type Zone = 'before' | 'after' | null

export default function DraggableSibling({
  childId,
  parentId,
  vertical,
  children,
}: Props) {
  const { moveNode, addNodeToStackById, fullData } = useSelectedNode()
  const [zone, setZone] = useState<Zone>(null)
  const [isDragging, setIsDragging] = useState(false)

  const computeZone = (e: React.DragEvent<HTMLDivElement>): Zone => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (vertical) {
      const y = e.clientY - rect.top
      return y < rect.height / 2 ? 'before' : 'after'
    }
    const x = e.clientX - rect.left
    return x < rect.width / 2 ? 'before' : 'after'
  }

  const indexOfChild = (): number => {
    if (!fullData) return -1
    let result = -1
    const visit = (node: { id?: string; children?: { id: string }[] }) => {
      if (result !== -1) return
      const anyNode = node as unknown as Record<string, unknown>
      if (anyNode.id === parentId && Array.isArray(anyNode.children)) {
        const arr = anyNode.children as Array<{ id: string }>
        result = arr.findIndex((c) => c.id === childId)
        return
      }
      Object.values(anyNode).forEach((v) => {
        if (v && typeof v === 'object') visit(v as never)
      })
    }
    visit(fullData as never)
    return result
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', childId)
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setZone(null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const isPalette = e.dataTransfer.types.includes(BLOCK_MIME)
    e.dataTransfer.dropEffect = isPalette ? 'copy' : 'move'
    setZone(computeZone(e))
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setZone(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const z = computeZone(e)
    setZone(null)

    const templateKind = e.dataTransfer.getData(BLOCK_MIME) as BlockKind | ''
    if (templateKind) {
      const tpl = BLOCK_TEMPLATES.find((t) => t.kind === templateKind)
      if (!tpl) return
      const idx = indexOfChild()
      if (idx === -1) return
      addNodeToStackById(parentId, tpl.build(), z === 'before' ? idx : idx + 1)
      return
    }

    const draggedId = e.dataTransfer.getData('text/plain')
    if (!draggedId || draggedId === childId) return
    moveNode(draggedId, childId, z ?? 'after')
  }

  const indicatorBase =
    'pointer-events-none absolute z-10 rounded-full bg-brand-400 shadow-glow'

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        'relative transition-transform',
        isDragging ? 'opacity-50 scale-[0.99]' : '',
      ].join(' ')}
      style={{ cursor: 'grab' }}
    >
      {zone === 'before' && (
        <div
          className={
            vertical
              ? `${indicatorBase} -top-1 left-0 right-0 h-0.5`
              : `${indicatorBase} -left-1 top-0 bottom-0 w-0.5`
          }
        />
      )}
      {zone === 'after' && (
        <div
          className={
            vertical
              ? `${indicatorBase} -bottom-1 left-0 right-0 h-0.5`
              : `${indicatorBase} -right-1 top-0 bottom-0 w-0.5`
          }
        />
      )}
      {children}
    </div>
  )
}
