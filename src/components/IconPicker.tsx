import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, X } from 'lucide-react'
import {
  CONSPECT_ICON_LIST,
  type ConspectIconGlyph,
  primaryKeyForGlyph,
} from '../lib/conspectIcons'

interface IconPickerProps {
  value: string
  onChange: (next: ConspectIconGlyph) => void
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [panelRect, setPanelRect] = useState({
    top: 0,
    left: 0,
    width: 240,
    maxHeight: 280,
  })

  const updatePanelPosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const margin = 8
    const maxH = Math.max(160, window.innerHeight - r.bottom - margin * 2)
    setPanelRect({
      top: r.bottom + 4,
      left: Math.max(margin, Math.min(r.left, window.innerWidth - r.width - margin)),
      width: Math.min(Math.max(r.width, 260), window.innerWidth - margin * 2),
      maxHeight: maxH,
    })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    updatePanelPosition()
    window.addEventListener('scroll', updatePanelPosition, true)
    window.addEventListener('resize', updatePanelPosition)
    return () => {
      window.removeEventListener('scroll', updatePanelPosition, true)
      window.removeEventListener('resize', updatePanelPosition)
    }
  }, [open, updatePanelPosition])

  useEffect(() => {
    if (!open) return
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CONSPECT_ICON_LIST
    return CONSPECT_ICON_LIST.filter(({ key, glyph }) => {
      const keyMatch = key.toLowerCase().includes(q)
      const tokenMatch = key
        .toLowerCase()
        .split('_')
        .some((part) => part.startsWith(q) || part.includes(q))
      const glyphMatch = glyph.toLowerCase().includes(q)
      return keyMatch || tokenMatch || glyphMatch
    })
  }, [query])

  const labelForValue = (glyph: string) => {
    const k = primaryKeyForGlyph(glyph)
    return k ?? 'Custom'
  }

  const panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="listbox"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.12 }}
          style={{
            position: 'fixed',
            top: panelRect.top,
            left: panelRect.left,
            width: panelRect.width,
            maxHeight: panelRect.maxHeight,
            zIndex: 9999,
          }}
          className="flex flex-col overflow-hidden rounded-lg border border-line bg-bg-surface shadow-float"
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-line px-2 py-1.5">
            <Search size={12} className="shrink-0 text-ink-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Search by name (e.g. FIRE)…"
              className="min-w-0 flex-1 bg-transparent text-xs text-ink-100 placeholder:text-ink-400 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="shrink-0 text-ink-400 hover:text-ink-200"
              >
                <X size={11} />
              </button>
            )}
          </div>
          <div
            className="min-h-[120px] flex-1 overflow-y-auto p-2"
            style={{ maxHeight: Math.max(120, panelRect.maxHeight - 88) }}
          >
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-[11px] text-ink-400">
                No icons match
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {filtered.map(({ key, glyph }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onChange(glyph)
                      setOpen(false)
                    }}
                    title={key}
                    className={[
                      'flex flex-col items-center gap-0.5 rounded-md border px-1 py-1.5 text-center transition',
                      value === glyph
                        ? 'border-brand-500/60 bg-brand-500/15 ring-1 ring-brand-500/40'
                        : 'border-transparent bg-bg-panel/50 hover:border-line hover:bg-bg-elevated',
                    ].join(' ')}
                  >
                    <span className="text-xl leading-none">{glyph}</span>
                    <span className="line-clamp-2 w-full break-all font-mono text-[9px] leading-tight text-ink-400">
                      {key}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center justify-between border-t border-line px-2 py-1.5 text-[10px] text-ink-400">
            <span>
              {filtered.length} / {CONSPECT_ICON_LIST.length} (API Icon enum)
            </span>
            <button
              type="button"
              onClick={() => {
                onChange(CONSPECT_ICON_LIST[0]!.glyph)
                setOpen(false)
              }}
              className="text-ink-300 hover:text-ink-100"
            >
              Reset to first
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-line bg-bg-surface px-2.5 py-1.5 text-xs text-ink-100 transition hover:border-line-strong focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="shrink-0 text-lg leading-none">{value || '–'}</span>
          <span className="min-w-0 truncate text-left text-[10px] leading-tight text-ink-400">
            {value ? labelForValue(value) : 'Pick icon (backend enum)'}
          </span>
        </span>
        <ChevronDown
          size={12}
          className={`shrink-0 text-ink-400 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {typeof document !== 'undefined' &&
        createPortal(panel, document.body)}
    </div>
  )
}
