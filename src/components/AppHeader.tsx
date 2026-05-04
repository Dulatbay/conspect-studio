import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  RotateCcw,
  Save,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSelectedNode } from '../context/hooks/context'

interface AppHeaderProps {
  onReset: () => void | Promise<void>
  onRenameTitle?: (next: string) => void
  isSaving?: boolean
}

export default function AppHeader({
  onReset,
  onRenameTitle,
  isSaving = false,
}: AppHeaderProps) {
  const { isSaved, saveFullData, conspectSession } = useSelectedNode()
  const [title, setTitle] = useState(conspectSession?.title ?? '')
  const [isResetting, setIsResetting] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setTitle(conspectSession?.title ?? '')
  }, [conspectSession?.id, conspectSession?.title])

  const handleReset = async () => {
    try {
      setIsResetting(true)
      await onReset()
    } finally {
      setIsResetting(false)
    }
  }

  const commitTitle = () => {
    const next = (title || '').trim()
    const current = (conspectSession?.title || '').trim()
    if (next && next !== current && onRenameTitle) {
      onRenameTitle(next)
    } else if (!next) {
      setTitle(conspectSession?.title ?? '')
    }
  }

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="relative z-20 flex h-14 items-center gap-3 border-b border-line bg-bg-subtle/80 px-3 backdrop-blur"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-ink-300 transition hover:bg-bg-elevated hover:text-ink-100"
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">All conspects</span>
      </Link>

      <div className="mx-2 h-6 w-px bg-line" />

      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-gradient shadow-glow">
          <Sparkles size={14} className="text-white" />
        </div>
        <span className="hidden text-xs font-medium text-ink-400 sm:inline">
          Conspect
        </span>
      </div>

      <div className="mx-1 h-6 w-px bg-line" />

      <input
        ref={inputRef}
        type="text"
        value={title}
        placeholder="Untitled"
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commitTitle}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur()
          } else if (e.key === 'Escape') {
            setTitle(conspectSession?.title ?? '')
            e.currentTarget.blur()
          }
        }}
        className="min-w-0 flex-1 rounded-md bg-transparent px-2 py-1 text-sm font-semibold text-ink-100 placeholder:text-ink-400 transition hover:bg-bg-elevated focus:bg-bg-elevated focus:outline-none"
      />

      <SavedChip isSaved={isSaved} isSaving={isSaving} />

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => void handleReset()}
          disabled={isResetting}
          title="Revert changes from server"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-bg-surface/70 px-3 py-1.5 text-xs text-ink-200 transition hover:border-line-strong hover:bg-bg-elevated disabled:opacity-50"
        >
          {isResetting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <RotateCcw size={12} />
          )}
          <span className="hidden sm:inline">Revert</span>
        </button>
        <button
          type="button"
          onClick={saveFullData}
          title="Save (Ctrl+S)"
          className="group inline-flex items-center gap-1.5 rounded-lg bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-glow transition hover:brightness-110"
        >
          <Save size={12} />
          Save
          <kbd className="hidden rounded border border-white/20 bg-white/10 px-1 text-[10px] text-white/80 sm:inline">
            Ctrl+S
          </kbd>
        </button>
      </div>
    </motion.header>
  )
}

function SavedChip({ isSaved, isSaving }: { isSaved: boolean; isSaving: boolean }) {
  if (isSaving) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-surface/60 px-2.5 py-1 text-xs text-ink-200">
        <Loader2 size={11} className="animate-spin text-brand-300" />
        Saving…
      </span>
    )
  }
  if (isSaved) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/10 px-2.5 py-1 text-xs text-accent-400">
        <Check size={11} />
        Saved
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400">
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
      Unsaved
    </span>
  )
}
