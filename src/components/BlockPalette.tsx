import { motion } from 'framer-motion'
import {
  Heading1,
  Type,
  Rows3,
  Columns3,
  LayoutTemplate,
  Target,
  Sparkle,
  GripVertical,
  Image as ImageIcon,
  Video as VideoIcon,
} from 'lucide-react'
import { BLOCK_MIME, BLOCK_TEMPLATES, type BlockKind } from '../lib/nodeTemplates'

const ICONS: Record<BlockKind, typeof Type> = {
  'text-h': Heading1,
  text: Type,
  'stack-v': Rows3,
  'stack-h': Columns3,
  titled: LayoutTemplate,
  centered: Target,
  'icon-text': Sparkle,
  image: ImageIcon,
  video: VideoIcon,
}

export default function BlockPalette() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
          Blocks
        </p>
        <p className="mt-0.5 text-xs text-ink-400">
          Drag onto any stack on canvas or in the tree
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3">
        {BLOCK_TEMPLATES.map((tpl, i) => {
          const Icon = ICONS[tpl.kind] ?? Type
          return (
            <motion.div
              key={tpl.kind}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            >
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'copy'
                  e.dataTransfer.setData(BLOCK_MIME, tpl.kind)
                  e.dataTransfer.setData('text/plain', `block:${tpl.kind}`)
                }}
                className="group relative flex cursor-grab flex-col gap-1 rounded-lg border border-line bg-bg-surface/60 p-3 transition hover:-translate-y-0.5 hover:border-brand-500/40 hover:bg-bg-elevated active:cursor-grabbing"
              >
                <GripVertical
                  size={12}
                  className="absolute right-2 top-2 text-ink-500 opacity-0 transition group-hover:opacity-100"
                />
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500/15 text-brand-300 transition group-hover:bg-brand-500/25">
                  <Icon size={14} />
                </div>
                <div className="mt-1">
                  <p className="text-xs font-semibold text-ink-100">
                    {tpl.label}
                  </p>
                  <p className="text-[11px] leading-tight text-ink-400">
                    {tpl.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-auto border-t border-line p-3 text-[11px] text-ink-400">
        <p className="mb-1 font-semibold text-ink-300">Tips</p>
        <ul className="space-y-1">
          <li>• Double-click text to edit inline</li>
          <li>• Delete — remove the selected block</li>
          <li>• Ctrl+Z / Ctrl+Shift+Z — undo / redo</li>
        </ul>
      </div>
    </div>
  )
}
