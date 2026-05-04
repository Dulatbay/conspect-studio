import { ArcherContainer } from 'react-archer'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Parser } from '../utills/parser/Parser.tsx'
import { BaseNode } from '../utills/parser/types.ts'
import { useSelectedNode } from '../context/hooks/context.ts'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ZoomIn, ZoomOut, RefreshCw, Eye } from 'lucide-react'
import AddNodeModal from './AddNodeModal.tsx'

const MainDrawBar = ({ obj }: { obj: BaseNode }) => {
  const { setSelectedNodeData, isAvailableToAdd, selectedNodeData } =
    useSelectedNode()
  const [showModal, setShowModal] = useState(false)

  return (
    <div
      className="relative h-full w-full min-h-0 min-w-0 flex-grow overflow-hidden canvas-grid"
      onClick={() => setSelectedNodeData(null)}
    >
      <AnimatePresence>
        {showModal && <AddNodeModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-bg-base/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-bg-base/80 to-transparent" />

      <TransformWrapper
        limitToBounds={false}
        centerOnInit={true}
        minScale={0.4}
        maxScale={4}
        wheel={{ step: 0.2 }}
        doubleClick={{ disabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="absolute left-1/2 top-4 z-20 -translate-x-1/2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1 rounded-full border border-line bg-bg-surface/80 p-1 shadow-float backdrop-blur">
                <ToolbarButton
                  onClick={() => zoomOut(0.2)}
                  title="Zoom out"
                >
                  <ZoomOut size={14} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => zoomIn(0.2)}
                  title="Zoom in"
                >
                  <ZoomIn size={14} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => resetTransform()}
                  title="Fit to view"
                >
                  <RefreshCw size={14} />
                </ToolbarButton>
                <span className="mx-1 h-5 w-px bg-line" />
                {isAvailableToAdd ? (
                  <motion.button
                    type="button"
                    layout
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowModal(true)}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-glow"
                  >
                    <Plus size={12} />
                    Add node
                  </motion.button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-ink-400">
                    <Eye size={12} />
                    Select a stack
                  </span>
                )}
              </div>
            </motion.div>

            <SelectionChip />

            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!min-h-full"
            >
              <div
                className="mx-auto flex w-[1200px] flex-col gap-6 px-0 py-20 sm:px-8"
                onClick={(e) => e.stopPropagation()}
              >
                <ArcherContainer
                  strokeColor="rgba(109, 112, 255, 0.7)"
                  strokeWidth={2}
                  endMarker={false}
                >
                  <Parser obj={obj} />
                </ArcherContainer>
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {!selectedNodeData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full border border-line bg-bg-surface/80 px-3 py-1.5 text-[11px] text-ink-400 shadow-float backdrop-blur"
        >
          Click a block to select · drag from the palette to add
        </motion.div>
      )}
    </div>
  )
}

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-300 transition hover:bg-bg-elevated hover:text-ink-100"
    >
      {children}
    </button>
  )
}

function SelectionChip() {
  const { selectedNodeData } = useSelectedNode()
  if (!selectedNodeData) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute right-4 top-4 z-20 rounded-full border border-line bg-bg-surface/80 px-3 py-1 text-[11px] font-medium text-ink-200 shadow-float backdrop-blur"
    >
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-400" />
      {selectedNodeData.nodeType}
      <span className="ml-1.5 font-mono text-ink-400">
        {selectedNodeData.id.slice(0, 6)}
      </span>
    </motion.div>
  )
}

export default MainDrawBar
