import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Network, Blocks, Crosshair } from 'lucide-react'
import type { BaseNode } from '../utills/parser/types'
import {
  isCenteredContainer,
  isIconText,
  isStackNode,
  isTitledContainer,
} from '../utills/parser/Parser'
import { useSelectedNode } from '../context/hooks/context'
import TreeNode from './TreeNode'
import BlockPalette from './BlockPalette'

type Tab = 'outline' | 'blocks'

interface SidePanelProps {
  obj?: BaseNode
}

export default function SidePanel({ obj }: SidePanelProps) {
  const [tab, setTab] = useState<Tab>('outline')
  const { selectedNodeData, setSelectedNodeData } = useSelectedNode()
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>(
    {}
  )

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const getChildren = (node: BaseNode): BaseNode[] | null => {
    if (isStackNode(node)) return node.children
    if (isTitledContainer(node)) return [node.titleText, node.content]
    if (isCenteredContainer(node)) {
      const out: BaseNode[] = [node.childNode]
      if (node.flippable && node.backChildNode) out.push(node.backChildNode)
      return out
    }
    if (isIconText(node)) return [node.text]
    return null
  }

  const expandCurrentNode = () => {
    if (!selectedNodeData || !obj) return
    const findPath = (
      node: BaseNode,
      path: string[] = []
    ): string[] | null => {
      if (node.id === selectedNodeData.id) return [...path, node.id]
      const children = getChildren(node)
      if (children) {
        for (const child of children) {
          const result = findPath(child, [...path, node.id])
          if (result) return result
        }
      }
      return null
    }
    const pathToSelected = findPath(obj)
    if (pathToSelected) {
      const expanded = pathToSelected.reduce(
        (acc, id) => {
          acc[id] = true
          return acc
        },
        {} as { [key: string]: boolean }
      )
      setExpandedNodes((prev) => ({ ...prev, ...expanded }))
    }
  }

  return (
    <div className="flex h-full min-w-[240px] flex-col bg-bg-panel/80 backdrop-blur">
      <div className="flex items-center gap-1 border-b border-line p-2">
        <TabButton
          active={tab === 'outline'}
          onClick={() => setTab('outline')}
          icon={<Network size={14} />}
          label="Outline"
        />
        <TabButton
          active={tab === 'blocks'}
          onClick={() => setTab('blocks')}
          icon={<Blocks size={14} />}
          label="Blocks"
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === 'outline' ? (
            <motion.div
              key="outline"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="flex h-full flex-col"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                    Tree
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    Click to select · drag to reorder
                  </p>
                </div>
                <button
                  type="button"
                  onClick={expandCurrentNode}
                  disabled={!selectedNodeData?.id}
                  title="Reveal the selected node"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink-300 transition hover:bg-bg-elevated hover:text-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Crosshair size={13} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {obj ? (
                  <TreeNode
                    node={obj}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                    handleClick={setSelectedNodeData}
                    getChildren={getChildren}
                    parentIsStack={false}
                    isRoot={true}
                  />
                ) : (
                  <p className="p-3 text-xs text-ink-400">No data</p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="blocks"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <BlockPalette />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition',
        active
          ? 'text-ink-100'
          : 'text-ink-400 hover:bg-bg-elevated hover:text-ink-200',
      ].join(' ')}
    >
      {active && (
        <motion.span
          layoutId="side-tab-indicator"
          className="absolute inset-0 rounded-md bg-bg-elevated ring-1 ring-line"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </button>
  )
}
