import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Search,
  Layers,
  Trash2,
  Pencil,
} from 'lucide-react'
import {
  useCreateModuleMutation,
  useDeleteModuleMutation,
  useListModulesQuery,
  useUpdateModuleMutation,
} from '../services/module/api'
import { useSelectedNode } from '../context/hooks/context'
import type { ModuleDto } from '../services/module/types'

const ModulesListPage = () => {
  const { reset } = useSelectedNode()
  const { data, isLoading, error, refetch } = useListModulesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const [createModule, { isLoading: isCreating }] = useCreateModuleMutation()
  const [updateModule] = useUpdateModuleMutation()
  const [deleteModule] = useDeleteModuleMutation()
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [editing, setEditing] = useState<ModuleDto | null>(null)

  useEffect(() => {
    reset()
  }, [reset])

  const rows = useMemo(() => {
    const all = data ?? []
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter(
      (m) =>
        m.title?.toLowerCase().includes(q) ||
        (m.description ?? '').toLowerCase().includes(q)
    )
  }, [data, query])

  const handleCreate = async () => {
    if (!draftTitle.trim()) return
    try {
      await createModule({
        title: draftTitle.trim(),
        description: draftDescription.trim() || undefined,
      }).unwrap()
      setCreating(false)
      setDraftTitle('')
      setDraftDescription('')
      await refetch()
    } catch {
      /* handled inline */
    }
  }

  const handleEditCommit = async () => {
    if (!editing) return
    try {
      await updateModule({
        id: editing.id,
        title: editing.title,
        description: editing.description ?? undefined,
      }).unwrap()
      setEditing(null)
    } catch {
      /* handled inline */
    }
  }

  const handleDelete = async (id: string, title: string) => {
    const confirmed = window.confirm(
      `Delete module "${title}"? All its conspects will also be removed.`
    )
    if (!confirmed) return
    try {
      await deleteModule(id).unwrap()
    } catch {
      /* silent */
    }
  }

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
              Dulatbay · Topic Content Studio
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-4xl font-black tracking-tight text-ink-100 sm:text-5xl"
            >
              Modules
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-2 max-w-xl text-sm text-ink-300"
            >
              Group conspects into learning modules and arrange them as a
              roadmap. Generate conspects manually or from uploaded files.
            </motion.p>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCreating(true)}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow transition"
          >
            <Plus
              size={16}
              className="transition-transform group-hover:rotate-90"
            />
            New module
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
              placeholder="Search by title or description…"
              className="w-full rounded-xl border border-line bg-bg-surface/60 py-2.5 pl-10 pr-4 text-sm text-ink-100 placeholder:text-ink-400 backdrop-blur transition focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-400">
            <span>{rows.length} modules</span>
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
                  /api/v1/modules
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
                className="shimmer h-44 rounded-xl border border-line bg-bg-surface/40"
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
              <Layers size={22} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-ink-100">
              No modules yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-ink-300">
              Create your first module to start grouping conspects into a
              roadmap.
            </p>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow"
            >
              <Plus size={14} />
              Create the first module
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
              {rows.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -2 }}
                  className="group relative"
                >
                  <Link
                    to={`/modules/${m.id}`}
                    className="relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-bg-surface/80 p-5 shadow-card backdrop-blur transition hover:border-brand-500/50 hover:shadow-float"
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-500/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300">
                        <Layers size={16} />
                      </div>
                      <ArrowUpRight
                        size={16}
                        className="text-ink-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-300"
                      />
                    </div>
                    <h3 className="line-clamp-2 text-base font-semibold text-ink-100 transition group-hover:text-white">
                      {m.title?.trim() || 'Untitled'}
                    </h3>
                    {m.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-ink-300">
                        {m.description}
                      </p>
                    ) : null}

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="text-xs text-ink-400">
                        {m.conspects?.length ?? 0} conspects
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setEditing(m)
                          }}
                          title="Edit module"
                          className="rounded-md p-1 text-ink-400 transition hover:bg-bg-elevated hover:text-ink-100"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            void handleDelete(m.id, m.title)
                          }}
                          title="Delete module"
                          className="rounded-md p-1 text-ink-400 transition hover:bg-danger-500/15 hover:text-danger-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {creating ? (
          <motion.div
            key="create-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => (!isCreating ? setCreating(false) : undefined)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-line bg-bg-surface p-6 shadow-float"
            >
              <h2 className="mb-4 text-base font-semibold text-ink-100">
                New module
              </h2>
              <label className="mb-1.5 block text-xs font-medium text-ink-300">
                Title
              </label>
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="e.g. Cardiology basics"
                className="mb-4 w-full rounded-lg border border-line bg-bg-base/60 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none"
              />
              <label className="mb-1.5 block text-xs font-medium text-ink-300">
                Description (optional)
              </label>
              <textarea
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                rows={3}
                placeholder="What this module is about…"
                className="mb-4 w-full resize-none rounded-lg border border-line bg-bg-base/60 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  disabled={isCreating}
                  className="rounded-lg border border-line bg-bg-surface px-3 py-1.5 text-sm text-ink-200 transition hover:bg-bg-elevated"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleCreate()}
                  disabled={!draftTitle.trim() || isCreating}
                  className="rounded-lg bg-brand-gradient px-3 py-1.5 text-sm font-semibold text-white shadow-glow disabled:opacity-50"
                >
                  {isCreating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {editing ? (
          <motion.div
            key="edit-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-line bg-bg-surface p-6 shadow-float"
            >
              <h2 className="mb-4 text-base font-semibold text-ink-100">
                Edit module
              </h2>
              <label className="mb-1.5 block text-xs font-medium text-ink-300">
                Title
              </label>
              <input
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
                className="mb-4 w-full rounded-lg border border-line bg-bg-base/60 px-3 py-2 text-sm text-ink-100 focus:border-brand-400 focus:outline-none"
              />
              <label className="mb-1.5 block text-xs font-medium text-ink-300">
                Description
              </label>
              <textarea
                value={editing.description ?? ''}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                rows={3}
                className="mb-4 w-full resize-none rounded-lg border border-line bg-bg-base/60 px-3 py-2 text-sm text-ink-100 focus:border-brand-400 focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-line bg-bg-surface px-3 py-1.5 text-sm text-ink-200 transition hover:bg-bg-elevated"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleEditCommit()}
                  disabled={!editing.title?.trim()}
                  className="rounded-lg bg-brand-gradient px-3 py-1.5 text-sm font-semibold text-white shadow-glow disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default ModulesListPage
