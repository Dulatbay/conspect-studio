import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
  AlertTriangle,
} from 'lucide-react'
import {
  useGetModuleQuery,
  useReorderConspectsMutation,
  useUpdateModuleMutation,
} from '../services/module/api'
import {
  useCreateConspectFromUploadMutation,
  useCreateConspectInModuleMutation,
  useDeleteConspectMutation,
} from '../services/conspect/api'
import { useSelectedNode } from '../context/hooks/context'
import type { ConspectSummary } from '../services/conspect/types'
import FileUploadModal from '../components/FileUploadModal'

const ModulePage = () => {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()
  const { reset } = useSelectedNode()

  const { data, isLoading, error, refetch } = useGetModuleQuery(
    moduleId ?? '',
    {
      skip: !moduleId,
      refetchOnMountOrArgChange: true,
    }
  )

  const [createInModule, { isLoading: isCreatingEmpty }] =
    useCreateConspectInModuleMutation()
  const [createFromUpload, { isLoading: isUploading }] =
    useCreateConspectFromUploadMutation()
  const [deleteConspect] = useDeleteConspectMutation()
  const [updateModule] = useUpdateModuleMutation()
  const [reorderConspects] = useReorderConspectsMutation()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  useEffect(() => {
    reset()
  }, [reset])

  useEffect(() => {
    setTitleDraft(data?.title ?? '')
  }, [data?.id, data?.title])

  const conspects: ConspectSummary[] = useMemo(
    () => [...(data?.conspects ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [data?.conspects]
  )

  const isAnyGenerating = useMemo(
    () => conspects.some((c) => c.isGenerating),
    [conspects]
  )

  useEffect(() => {
    if (!moduleId) return
    if (!isAnyGenerating) return
    const interval = setInterval(() => {
      void refetch()
    }, 1500)
    return () => clearInterval(interval)
  }, [moduleId, isAnyGenerating, refetch])

  const handleCreateEmpty = async () => {
    if (!moduleId) return
    try {
      const created = await createInModule({ moduleId }).unwrap()
      navigate(`/editor/${created.id}`)
    } catch {
      /* silent */
    }
  }

  const handleUpload = async ({
    file,
    language,
  }: {
    file: File
    language: 'RU' | 'KAZ' | 'ENG'
  }) => {
    if (!moduleId) return
    await createFromUpload({
      moduleId,
      file,
      language,
    }).unwrap()
    setUploadOpen(false)
    await refetch()
  }

  const handleDeleteConspect = async (id: string, title: string) => {
    if (!window.confirm(`Delete conspect "${title || 'Untitled'}"?`)) return
    try {
      await deleteConspect(id).unwrap()
    } catch {
      /* silent */
    }
  }

  const handleTitleCommit = async () => {
    if (!moduleId || !data) return
    const next = titleDraft.trim()
    if (!next || next === data.title) {
      setTitleDraft(data.title)
      return
    }
    try {
      await updateModule({ id: moduleId, title: next }).unwrap()
    } catch {
      setTitleDraft(data.title)
    }
  }

  const handleDrop = async (targetId: string) => {
    if (!moduleId || !draggedId || draggedId === targetId) {
      setDraggedId(null)
      setOverId(null)
      return
    }
    const ids = conspects.map((c) => c.id)
    const fromIdx = ids.indexOf(draggedId)
    const toIdx = ids.indexOf(targetId)
    if (fromIdx === -1 || toIdx === -1) {
      setDraggedId(null)
      setOverId(null)
      return
    }
    const next = [...ids]
    next.splice(fromIdx, 1)
    next.splice(toIdx, 0, draggedId)
    setDraggedId(null)
    setOverId(null)
    try {
      await reorderConspects({ id: moduleId, conspectIds: next }).unwrap()
    } catch {
      /* silent */
    }
  }

  if (!moduleId) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-base">
        <p className="text-sm text-danger-400">Module id is missing</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
      <div className="pointer-events-none absolute inset-0 bg-grid-soft bg-grid opacity-40" />

      {isUploading ? (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-bg-base/70 backdrop-blur-sm">
          <Loader2 size={40} className="animate-spin text-brand-300" />
          <p className="mt-4 text-sm font-medium text-ink-200">
            Uploading and starting AI…
          </p>
          <p className="mt-1 max-w-xs text-center text-xs text-ink-400">
            Stay on this page — the new conspect will appear in the roadmap when
            the job is queued.
          </p>
        </div>
      ) : null}

      <div className="relative mx-auto max-w-3xl px-6 py-12 sm:px-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-ink-300 transition hover:bg-bg-elevated hover:text-ink-100"
        >
          <ArrowLeft size={16} />
          All modules
        </Link>

        {isLoading ? (
          <div className="space-y-3">
            <div className="shimmer h-12 rounded-xl border border-line bg-bg-surface/40" />
            <div className="shimmer h-32 rounded-xl border border-line bg-bg-surface/40" />
            <div className="shimmer h-32 rounded-xl border border-line bg-bg-surface/40" />
          </div>
        ) : error || !data ? (
          <div className="flex items-start gap-3 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-400">
            <AlertTriangle size={18} className="mt-0.5" />
            <p>Could not load this module.</p>
          </div>
        ) : (
          <>
            <header className="mb-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-ink-400">
                <Sparkles size={12} className="text-brand-300" />
                Module · {conspects.length} conspect
                {conspects.length === 1 ? '' : 's'}
              </div>
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleTitleCommit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur()
                  } else if (e.key === 'Escape') {
                    setTitleDraft(data.title)
                    e.currentTarget.blur()
                  }
                }}
                className="rounded-lg bg-transparent px-1 py-1 text-3xl font-black tracking-tight text-ink-100 transition hover:bg-bg-elevated focus:bg-bg-elevated focus:outline-none"
              />
              {data.description ? (
                <p className="text-sm text-ink-300">{data.description}</p>
              ) : null}
            </header>

            <div className="mb-6 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void handleCreateEmpty()}
                disabled={isCreatingEmpty}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-bg-surface/70 px-3 py-2 text-xs font-medium text-ink-200 transition hover:border-line-strong hover:bg-bg-elevated disabled:opacity-50"
              >
                {isCreatingEmpty ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                Add empty conspect
              </button>
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-gradient px-3 py-2 text-xs font-semibold text-white shadow-glow"
              >
                <UploadCloud size={14} />
                Generate from file
              </button>
              {isAnyGenerating ? (
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-xs text-brand-200">
                  <Loader2 size={11} className="animate-spin" />
                  AI generating…
                </span>
              ) : null}
            </div>

            {conspects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-bg-surface/40 px-8 py-16 text-center"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
                  <FileText size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-ink-100">
                  Roadmap is empty
                </h3>
                <p className="mt-1 max-w-sm text-sm text-ink-300">
                  Add a conspect manually or upload a file and let AI build it
                  for you.
                </p>
              </motion.div>
            ) : (
              <ol className="relative space-y-3">
                <AnimatePresence mode="popLayout">
                  {conspects.map((c, idx) => (
                    <motion.li
                      layout
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="relative"
                    >
                      {idx > 0 ? (
                        <span className="absolute -top-3 left-7 h-3 w-px bg-line" />
                      ) : null}
                      <div
                        draggable={!c.isGenerating}
                        onDragStart={() => setDraggedId(c.id)}
                        onDragOver={(e) => {
                          e.preventDefault()
                          if (draggedId && draggedId !== c.id) setOverId(c.id)
                        }}
                        onDragLeave={() => {
                          if (overId === c.id) setOverId(null)
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          void handleDrop(c.id)
                        }}
                        onDragEnd={() => {
                          setDraggedId(null)
                          setOverId(null)
                        }}
                        className={`group flex items-stretch gap-3 rounded-xl border bg-bg-surface/80 p-4 shadow-card backdrop-blur transition ${
                          c.isGenerating
                            ? 'border-brand-500/40 cursor-default animate-pulse'
                            : overId === c.id
                              ? 'border-brand-400 hover:shadow-float'
                              : 'border-line hover:border-brand-500/50 hover:shadow-float'
                        } ${draggedId === c.id ? 'opacity-60' : ''}`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold ${
                              c.isGenerating
                                ? 'bg-brand-500/25 text-brand-200'
                                : 'bg-brand-500/15 text-brand-200'
                            }`}
                          >
                            {c.isGenerating ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            {c.isGenerating ? (
                              <div className="block min-w-0">
                                <h3 className="truncate text-sm font-semibold text-ink-200">
                                  {c.title?.trim() || 'Generating…'}
                                </h3>
                                <p className="mt-0.5 truncate font-mono text-[11px] text-ink-500">
                                  {c.id}
                                </p>
                                <p className="mt-1 text-[11px] text-ink-400">
                                  Wait for AI to finish — editing opens when
                                  ready.
                                </p>
                              </div>
                            ) : (
                              <Link
                                to={`/editor/${c.id}`}
                                className="block min-w-0"
                              >
                                <h3 className="truncate text-sm font-semibold text-ink-100 transition group-hover:text-white">
                                  {c.title?.trim() || 'Untitled'}
                                </h3>
                                <p className="mt-0.5 truncate font-mono text-[11px] text-ink-400">
                                  {c.id}
                                </p>
                              </Link>
                            )}
                            <div className="flex items-center gap-1">
                              {c.isGenerating ? (
                                <span
                                  title="Open when generation completes"
                                  className="cursor-not-allowed rounded-md p-1 text-ink-500"
                                >
                                  <ArrowUpRight size={14} />
                                </span>
                              ) : (
                                <Link
                                  to={`/editor/${c.id}`}
                                  title="Open"
                                  className="rounded-md p-1 text-ink-400 transition hover:bg-bg-elevated hover:text-brand-200"
                                >
                                  <ArrowUpRight size={14} />
                                </Link>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  void handleDeleteConspect(c.id, c.title ?? '')
                                }
                                title="Delete"
                                className="rounded-md p-1 text-ink-400 transition hover:bg-danger-500/15 hover:text-danger-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                            {c.isGenerating ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-brand-200">
                                <Loader2
                                  size={10}
                                  className="animate-spin"
                                />
                                Generating…
                              </span>
                            ) : null}
                            {c.aiError ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-danger-500/30 bg-danger-500/10 px-2 py-0.5 text-danger-400">
                                <AlertTriangle size={10} />
                                Failed
                              </span>
                            ) : null}
                            {c.sourceFilename ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-line bg-bg-elevated/60 px-2 py-0.5 text-ink-300">
                                <FileText size={10} />
                                {c.sourceFilename}
                              </span>
                            ) : null}
                            {c.lastModifiedDate ? (
                              <span className="inline-flex items-center gap-1 text-ink-400">
                                <Clock size={10} />
                                {new Date(
                                  c.lastModifiedDate
                                ).toLocaleDateString()}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            )}
          </>
        )}
      </div>

      <FileUploadModal
        isOpen={uploadOpen}
        title="Generate conspect from file"
        description="Upload a PDF, DOCX, XLSX, TXT or MD. The AI will build a conspect and add it to this module."
        submitLabel="Generate"
        isSubmitting={isUploading}
        onClose={() => (!isUploading ? setUploadOpen(false) : undefined)}
        onSubmit={handleUpload}
      />
    </div>
  )
}

export default ModulePage
