import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Type,
  Rows3,
  LayoutTemplate,
  Target,
  Sparkle,
  Boxes,
  GripVertical,
  Image as ImageIcon,
  Video as VideoIcon,
} from 'lucide-react'
import type { BaseNode } from '../utills/parser/types'
import {
  isCenteredContainer,
  isIconText,
  isImage,
  isStackNode,
  isTextNode,
  isTitledContainer,
  isVideo,
} from '../utills/parser/Parser'
import { useSelectedNode } from '../context/hooks/context'
import { BLOCK_MIME, BLOCK_TEMPLATES, type BlockKind } from '../lib/nodeTemplates'

interface TreeNodeProps {
  node: BaseNode
  expandedNodes: { [key: string]: boolean }
  toggleNode: (id: string) => void
  handleClick: (node: BaseNode) => void
  getChildren: (node: BaseNode) => BaseNode[] | null
  parentIsStack?: boolean
  isRoot?: boolean
  depth?: number
}

type DropZone = 'before' | 'after' | 'inside' | null

const TreeNode = ({
  node,
  expandedNodes,
  toggleNode,
  handleClick,
  getChildren,
  parentIsStack = false,
  isRoot = false,
  depth = 0,
}: TreeNodeProps) => {
  const { selectedNodeData, moveNode, addNodeToStackById } = useSelectedNode()
  const [dropZone, setDropZone] = useState<DropZone>(null)

  let label = 'Node'
  let Icon = Boxes
  if (isStackNode(node)) {
    label = node.vertical ? 'Stack ↕' : 'Stack ↔'
    Icon = Rows3
  } else if (isTextNode(node)) {
    label = 'Text'
    Icon = Type
  } else if (isIconText(node)) {
    label = 'Icon + text'
    Icon = Sparkle
  } else if (isTitledContainer(node)) {
    label = 'Card'
    Icon = LayoutTemplate
  } else if (isCenteredContainer(node)) {
    label = node.flippable ? 'Center · flip' : 'Center'
    Icon = Target
  } else if (isImage(node)) {
    label = 'Image'
    Icon = ImageIcon
  } else if (isVideo(node)) {
    label = 'Video'
    Icon = VideoIcon
  }

  const children = getChildren(node)
  const hasChildren = !!children && children.length > 0
  const isSelected = selectedNodeData?.id === node.id
  const isDraggableSource = parentIsStack && !isRoot
  const isStack = isStackNode(node)
  const acceptsDrop = isDraggableSource || isStack

  const computeZone = (
    e: React.DragEvent<HTMLDivElement>,
    allowInside: boolean
  ): DropZone => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const h = rect.height
    if (allowInside && isStack && !isDraggableSource) return 'inside'
    if (allowInside && isStack) {
      if (y < h * 0.25) return 'before'
      if (y > h * 0.75) return 'after'
      return 'inside'
    }
    return y < h * 0.5 ? 'before' : 'after'
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isDraggableSource) {
      e.preventDefault()
      return
    }
    e.stopPropagation()
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', node.id)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!acceptsDrop) return
    e.preventDefault()
    e.stopPropagation()
    const isPalette = e.dataTransfer.types.includes(BLOCK_MIME)
    e.dataTransfer.dropEffect = isPalette ? 'copy' : 'move'
    setDropZone(computeZone(e, true))
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (!acceptsDrop) return
    e.preventDefault()
    e.stopPropagation()
    setDropZone(computeZone(e, true))
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setDropZone(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!acceptsDrop) return
    e.preventDefault()
    e.stopPropagation()
    const zone = computeZone(e, true)
    setDropZone(null)

    const templateKind = e.dataTransfer.getData(BLOCK_MIME) as BlockKind | ''
    if (templateKind) {
      const tpl = BLOCK_TEMPLATES.find((t) => t.kind === templateKind)
      if (!tpl) return
      if (isStack && zone === 'inside') {
        addNodeToStackById(node.id, tpl.build())
      }
      return
    }

    if (!isDraggableSource && !isStack) return
    const draggedNodeId = e.dataTransfer.getData('text/plain')
    if (!draggedNodeId || draggedNodeId === node.id) return
    moveNode(draggedNodeId, node.id, zone ?? 'inside')
  }

  return (
    <div className="relative">
      {dropZone === 'before' && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-0.5 left-0 right-0 z-10 h-0.5 rounded-full bg-brand-400 shadow-glow"
          style={{ marginLeft: depth * 12 + 6 }}
        />
      )}
      {dropZone === 'after' && (
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-0.5 left-0 right-0 z-10 h-0.5 rounded-full bg-brand-400 shadow-glow"
          style={{ marginLeft: depth * 12 + 6 }}
        />
      )}
      <div
        style={{ paddingLeft: depth * 12 + 6 }}
        className={[
          'group relative flex cursor-pointer items-center gap-1.5 rounded-md py-1.5 pr-2 transition',
          isSelected
            ? 'bg-brand-500/15 text-ink-100 ring-1 ring-brand-500/40'
            : 'text-ink-300 hover:bg-bg-elevated hover:text-ink-100',
          dropZone === 'inside' ? 'ring-1 ring-brand-400/70 bg-brand-500/10' : '',
        ].join(' ')}
        onClick={(e) => {
          e.stopPropagation()
          handleClick(node)
          if (hasChildren) toggleNode(node.id)
        }}
        draggable={isDraggableSource}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDraggableSource && (
          <GripVertical
            size={10}
            className="opacity-0 transition group-hover:opacity-100 text-ink-500"
          />
        )}
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation()
            if (hasChildren) toggleNode(node.id)
          }}
          className="inline-flex h-4 w-4 items-center justify-center text-ink-400 transition hover:text-ink-200"
        >
          {hasChildren ? (
            expandedNodes[node.id] ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )
          ) : (
            <span className="block h-1 w-1 rounded-full bg-ink-500/50" />
          )}
        </button>
        <Icon
          size={12}
          className={isSelected ? 'text-brand-300' : 'text-ink-400'}
        />
        <span className="truncate text-xs">{label}</span>
        {isStackNode(node) ? (
          <span className="ml-auto text-[10px] text-ink-500">
            {node.children?.length ?? 0}
          </span>
        ) : null}
      </div>

      {hasChildren && expandedNodes[node.id] && (
        <div>
          {children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              handleClick={handleClick}
              getChildren={getChildren}
              isRoot={false}
              parentIsStack={isStackNode(node)}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TreeNode
