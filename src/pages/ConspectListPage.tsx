import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  FileText,
  Clock,
  Search,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react'
import {
  useCreateConspectMutation,
  useListConspectsQuery,
} from '../services/conspect/api'
import { useSelectedNode } from '../context/hooks/context'
import { useEffect } from 'react'

function formatRelative(date?: string | null) {
  if (!date) return 'just now'
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} d ago`
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const ConspectListPage = () => {
  const navigate = useNavigate()
  const { reset } = useSelectedNode()
  const { data, isLoading, error, refetch } = useListConspectsQuery({
    page: 0,
    size: 100,
  })
  const [createConspect, { isLoading: isCreating }] =
    useCreateConspectMutation()
  const [query, setQuery] = useState('')

  useEffect(() => {
    reset()
  }, [reset])

  const handleCreate = async () => {
    try {
      const created = await createConspect({
        title: 'Untitled conspect',
      }).unwrap()
      navigate(`/editor/${created.id}`)
    } catch {
      /* handled by toast/error state */
    }
  }

  const rows = useMemo(() => {
    const all = data?.content ?? []
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter(
      (c) =>
        (c.title?.toLowerCase().includes(q) ?? false) ||
        c.id.toLowerCase().includes(q)
    )
  }, [data, query])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
      <div className="pointer-events-none absolute inset-0 bg-grid-soft bg-grid opacity-40" />

      <div className="relative mx-auto max-w-6xl px-6 py-12 sm:px-10">
        <header className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-bg-surface/60 px-3 py-1 text-xs text-ink-300 backdrop-blur"
            >
              <Sparkles size={12} className="text-brand-300" />
              Nuraimed · Topic Content Studio
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-4xl font-black tracking-tight text-ink-100 sm:text-5xl"
            >
              Conspects
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-2 max-w-xl text-sm text-ink-300"
            >
              A block-based content editor with live grid, stacks and
              drag-and-drop. Build, edit and rearrange elements in seconds.
            </motion.p>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={isCreating}
            onClick={() => void handleCreate()}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow transition disabled:opacity-60"
          >
            <Plus
              size={16}
              className="transition-transform group-hover:rotate-90"
            />
            {isCreating ? 'Creating…' : 'New conspect'}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </motion.button>
        </header>

        <div className="mb-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or id…"
              className="w-full rounded-xl border border-line bg-bg-surface/60 py-2.5 pl-10 pr-4 text-sm text-ink-100 placeholder:text-ink-400 backdrop-blur transition focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-400">
            <span>{rows.length} conspects</span>
            <span className="h-1 w-1 rounded-full bg-ink-500" />
            <button
              type="button"
              className="rounded-md px-2 py-1 text-ink-300 transition hover:bg-bg-elevated hover:text-ink-100"
              onClick={() => refetch()}
            >
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-400"
          >
            <AlertTriangle size={18} className="mt-0.5" />
            <div>
              <p className="font-semibold">Could not reach the API</p>
              <p className="mt-1 text-ink-300">
                Check{' '}
                <code className="rounded bg-bg-surface px-1 py-0.5 text-ink-100">
                  VITE_CONSPECT_API_URL
                </code>{' '}
                and CORS for{' '}
                <code className="rounded bg-bg-surface px-1 py-0.5 text-ink-100">
                  /api/v1/conspects
                </code>
                .
              </p>
            </div>
          </motion.div>
        ) : null}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="shimmer h-36 rounded-xl border border-line bg-bg-surface/40"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-bg-surface/40 px-8 py-16 text-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
              <FileText size={22} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-ink-100">
              No conspects yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-ink-300">
              Create your first conspect and start composing the page out of
              blocks and stacks.
            </p>
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={isCreating}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow"
            >
              <Plus size={14} />
              Create the first one
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.04 },
              },
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {rows.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -2 }}
                  className="group relative"
                >
                  <Link
                    to={`/editor/${c.id}`}
                    className="relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-bg-surface/80 p-5 shadow-card backdrop-blur transition hover:border-brand-500/50 hover:shadow-float"
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-500/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300">
                        <FileText size={16} />
                      </div>
                      <ArrowUpRight
                        size={16}
                        className="text-ink-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-300"
                      />
                    </div>
                    <h3 className="line-clamp-2 text-base font-semibold text-ink-100 transition group-hover:text-white">
                      {c.title?.trim() || 'Untitled'}
                    </h3>
                    <p className="mt-1 truncate font-mono text-xs text-ink-400">
                      {c.id}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center gap-1.5 text-xs text-ink-400">
                        <Clock size={12} />
                        {formatRelative(null)}
                      </div>
                      <div className="flex items-center gap-1">
                        {['EN', 'RU', 'KZ'].map((lang) => (
                          <span
                            key={lang}
                            className="rounded-md border border-line px-1.5 py-0.5 text-[10px] font-medium text-ink-300"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ConspectListPage
