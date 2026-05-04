import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, ArrowRight, ChevronRight, Trash2 } from 'lucide-react'
import { useSelectedNode } from '../context/hooks/context.ts'
import { BaseNode, NodeType } from '../utills/parser/types.ts'
import { makeByType, makeText } from '../lib/nodeTemplates.ts'

const PRIMITIVES: { type: NodeType; label: string; hint: string }[] = [
  { type: NodeType.TEXT, label: 'Text', hint: 'HTML paragraph' },
  { type: NodeType.STACK, label: 'Stack', hint: 'Column or row of blocks' },
  { type: NodeType.ICON_TEXT, label: 'Icon + text', hint: 'Icon followed by a text line' },
  { type: NodeType.IMAGE, label: 'Image', hint: 'Picture from a URL' },
  { type: NodeType.VIDEO, label: 'Video', hint: 'Click to play' },
]

const CONTAINERS: { type: NodeType; label: string; hint: string }[] = [
  {
    type: NodeType.TITLED_CONTAINER,
    label: 'Titled container',
    hint: 'Title + any block as content',
  },
  {
    type: NodeType.CENTERED_CONTAINER,
    label: 'Centered container',
    hint: 'Any block centered inside',
  },
]

const ALL_OPTIONS = [...PRIMITIVES, ...CONTAINERS]

function isContainer(type: NodeType): boolean {
  return (
    type === NodeType.TITLED_CONTAINER || type === NodeType.CENTERED_CONTAINER
  )
}

function buildFromChain(chain: NodeType[]): BaseNode {
  if (chain.length === 0) return makeText()
  const build = (index: number): BaseNode => {
    const type = chain[index]
    const isLast = index === chain.length - 1
    if (isContainer(type) && !isLast) {
      return makeByType(type, build(index + 1))
    }
    return makeByType(type)
  }
  return build(0)
}

const AddNodeModal = ({ onClose }: { onClose: () => void }) => {
  const { addNodeToSelectedStack } = useSelectedNode()
  const [chain, setChain] = useState<NodeType[]>([])

  const head = chain[0]
  const needsContent = head && isContainer(head)
  const hasContent = chain.length > 1
  const readyToAdd = !!head && (!needsContent || hasContent)

  const preview = useMemo(() => chain.map((t) => labelOf(t)).join('  ›  '), [chain])

  const setHead = (t: NodeType) => {
    setChain((prev) => {
      if (prev[0] === t) return prev
      return [t]
    })
  }

  const setContentType = (t: NodeType) => {
    setChain((prev) => {
      if (prev.length === 0) return prev
      const copy = [...prev]
      copy[1] = t
      copy.length = 2
      return copy
    })
  }

  const setNestedContent = (t: NodeType) => {
    setChain((prev) => {
      if (prev.length < 2) return prev
      return [...prev, t]
    })
  }

  const popLast = () => {
    setChain((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }

  const handleAdd = () => {
    if (!readyToAdd) return
    const node = buildFromChain(chain)
    addNodeToSelectedStack(node)
    onClose()
  }

  const lastType = chain[chain.length - 1]
  const canGoDeeper = lastType && isContainer(lastType)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-line bg-bg-surface p-6 shadow-float"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink-100">Add block</h2>
            <p className="mt-1 text-xs text-ink-400">
              Pick a root type. For containers you can choose what their content
              should be.
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition hover:bg-bg-elevated hover:text-ink-100"
          >
            <X size={14} />
          </button>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            Root block
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ALL_OPTIONS.map((opt) => {
              const active = head === opt.type
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setHead(opt.type)}
                  className={[
                    'flex items-center justify-between rounded-xl border p-3 text-left transition',
                    active
                      ? 'border-brand-500/60 bg-brand-500/10 text-ink-100 shadow-glow'
                      : 'border-line bg-bg-panel hover:border-line-strong hover:bg-bg-elevated',
                  ].join(' ')}
                >
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-[11px] text-ink-400">{opt.hint}</p>
                  </div>
                  <ArrowRight
                    size={14}
                    className={active ? 'text-brand-300' : 'text-ink-500'}
                  />
                </button>
              )
            })}
          </div>
        </div>

        {needsContent && (
          <div className="mt-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
              Content of {labelOf(head!)}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ALL_OPTIONS.map((opt) => {
                const active = chain[1] === opt.type
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setContentType(opt.type)}
                    className={[
                      'rounded-lg border p-2 text-left transition',
                      active
                        ? 'border-brand-500/60 bg-brand-500/10 text-ink-100'
                        : 'border-line bg-bg-panel hover:bg-bg-elevated',
                    ].join(' ')}
                  >
                    <p className="text-xs font-medium">{opt.label}</p>
                    <p className="text-[10px] text-ink-400">{opt.hint}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {canGoDeeper && chain.length > 1 && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                Nest deeper (optional)
              </p>
              {chain.length > 1 && (
                <button
                  type="button"
                  onClick={popLast}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-ink-400 transition hover:bg-bg-elevated hover:text-ink-200"
                >
                  <Trash2 size={10} />
                  Remove last
                </button>
              )}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ALL_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setNestedContent(opt.type)}
                  className="rounded-lg border border-dashed border-line bg-bg-panel/50 p-2 text-left text-xs text-ink-300 transition hover:border-brand-500/40 hover:bg-bg-elevated"
                >
                  + {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {chain.length > 0 && (
          <div className="mt-5 flex items-center gap-1.5 rounded-lg border border-line bg-bg-panel/60 px-3 py-2 text-[11px] text-ink-300">
            <ChevronRight size={12} className="text-ink-500" />
            <span className="font-mono">{preview}</span>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs text-ink-300 transition hover:bg-bg-elevated hover:text-ink-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!readyToAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-glow transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={12} />
            Add
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function labelOf(t: NodeType): string {
  switch (t) {
    case NodeType.TEXT:
      return 'Text'
    case NodeType.STACK:
      return 'Stack'
    case NodeType.TITLED_CONTAINER:
      return 'Titled'
    case NodeType.CENTERED_CONTAINER:
      return 'Centered'
    case NodeType.ICON_TEXT:
      return 'Icon + text'
    case NodeType.IMAGE:
      return 'Image'
    case NodeType.VIDEO:
      return 'Video'
    default:
      return t
  }
}

export default AddNodeModal
