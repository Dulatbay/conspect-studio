import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Split from 'react-split'
import { motion } from 'framer-motion'
import { AlertTriangle, Loader2, Sparkles } from 'lucide-react'
import {
  useGetConspectQuery,
  useRegenerateConspectMutation,
  useUpdateConspectMutation,
} from '../services/conspect/api.ts'
import { useSelectedNode } from '../context/hooks/context.ts'
import { pickConspectContent } from '../lib/pickConspectContent.ts'
import { createDefaultRootTree } from '../lib/defaultRoot.ts'
import AppHeader from '../components/AppHeader.tsx'
import SidePanel from '../components/SidePanel.tsx'
import MainDrawBar from '../components/MainDrawBar.tsx'
import PropertiesBar from '../components/PropertiesBar.tsx'
import FileUploadModal from '../components/FileUploadModal.tsx'
import type { ConspectLanguage } from '../services/conspect/types.ts'

const ConspectEditorPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isFetching, error, refetch } = useGetConspectQuery(
    id ?? '',
    {
      skip: !id,
      refetchOnMountOrArgChange: true,
    }
  )
  const [updateConspect, { isLoading: isRenaming }] = useUpdateConspectMutation()
  const [regenerateConspect, { isLoading: isRegenerating }] =
    useRegenerateConspectMutation()

  const {
    fullData,
    setFullData,
    reset,
    setConspectSession,
    setSelectedNodeData,
    handleIsSaved,
  } = useSelectedNode()

  const loadedIdRef = useRef<string | null>(null)
  const lastModifiedRef = useRef<string | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)

  const isGenerating = data?.isGenerating === true

  useEffect(() => {
    if (!id || !isGenerating) return
    const interval = setInterval(() => {
      void refetch()
    }, 1500)
    return () => clearInterval(interval)
  }, [id, isGenerating, refetch])

  useEffect(() => {
    loadedIdRef.current = null
    lastModifiedRef.current = null
    setIsBootstrapping(true)
    reset()
  }, [id, reset])

  useEffect(() => {
    if (!data || !id) return
    if (isGenerating) {
      setConspectSession({ id, title: data.title })
      return
    }
    const stamp = data.lastModifiedDate ?? null
    const alreadyLoaded =
      loadedIdRef.current === id && lastModifiedRef.current === stamp
    if (alreadyLoaded) return
    loadedIdRef.current = id
    lastModifiedRef.current = stamp
    const content = pickConspectContent(data) ?? createDefaultRootTree()
    setFullData(content)
    setConspectSession({ id, title: data.title })
    setSelectedNodeData(content)
    handleIsSaved(true)
    setIsBootstrapping(false)
  }, [
    data,
    id,
    isGenerating,
    setFullData,
    setConspectSession,
    setSelectedNodeData,
    handleIsSaved,
  ])

  const handleReset = async () => {
    const result = await refetch()
    if (!id || !result.data) return
    if (result.data.isGenerating) return
    const content = pickConspectContent(result.data) ?? createDefaultRootTree()
    loadedIdRef.current = id
    lastModifiedRef.current = result.data.lastModifiedDate ?? null
    setFullData(content)
    setConspectSession({ id, title: result.data.title })
    setSelectedNodeData(content)
    handleIsSaved(true)
  }

  const handleRenameTitle = async (next: string) => {
    if (!id) return
    try {
      const updated = await updateConspect({ id, title: next } as {
        id: string
        title?: string
      }).unwrap()
      setConspectSession({ id, title: updated?.title ?? next })
    } catch {
      /* silent */
    }
  }

  const handleRegenerate = async ({
    file,
    language,
  }: {
    file: File
    language: ConspectLanguage
  }) => {
    if (!id) return
    await regenerateConspect({ id, file, language }).unwrap()
    setUploadOpen(false)
    loadedIdRef.current = null
    lastModifiedRef.current = null
    setIsBootstrapping(true)
  }

  const overlayState = useMemo<'generating' | 'failed' | null>(() => {
    if (!data) return null
    if (data.isGenerating) return 'generating'
    if (
      data.aiError &&
      !pickConspectContent(data)
    ) {
      return 'failed'
    }
    return null
  }, [data])

  if (!id) {
    return <ErrorScreen message="Conspect id is missing" />
  }

  if (
    (isLoading || (isBootstrapping && !overlayState) || (!fullData && !overlayState)) &&
    !error
  ) {
    return <LoadingScreen />
  }

  if (error) {
    return <ErrorScreen message="Failed to load the conspect" />
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-bg-base">
      {data?.isGenerating ? (
        <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-bg-subtle/80 px-4 backdrop-blur">
          {data.moduleId ? (
            <Link
              to={`/modules/${data.moduleId}`}
              className="text-sm text-ink-300 transition hover:text-ink-100"
            >
              ← Back to module
            </Link>
          ) : (
            <Link to="/" className="text-sm text-ink-300 transition hover:text-ink-100">
              ← Home
            </Link>
          )}
          <span className="inline-flex items-center gap-2 text-sm text-brand-200">
            <Loader2 size={16} className="animate-spin" />
            Generating…
          </span>
          <span className="w-24" aria-hidden />
        </header>
      ) : (
        <AppHeader
          onReset={handleReset}
          onRenameTitle={handleRenameTitle}
          onRegenerateClick={() => setUploadOpen(true)}
          isSaving={isRenaming || isFetching}
        />
      )}

      <div className="relative flex-1 min-h-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 bg-radial-fade" />

        {overlayState ? (
          <GenerationOverlay
            state={overlayState}
            error={data?.aiError ?? null}
            sourceFilename={data?.sourceFilename ?? null}
            onRetry={() => setUploadOpen(true)}
          />
        ) : (
          <Split
            className="relative flex h-full min-h-0 w-full"
            sizes={[22, 56, 22]}
            minSize={[240, 400, 280]}
            gutterSize={8}
            gutterAlign="center"
            direction="horizontal"
          >
            <SidePanel obj={fullData ?? undefined} />
            <MainDrawBar obj={fullData!} />
            <PropertiesBar />
          </Split>
        )}
      </div>

      <FileUploadModal
        isOpen={uploadOpen}
        title="Regenerate from file"
        description="The current content will be replaced with the AI result based on the uploaded file."
        submitLabel="Regenerate"
        isSubmitting={isRegenerating}
        onClose={() => (!isRegenerating ? setUploadOpen(false) : undefined)}
        onSubmit={handleRegenerate}
      />
    </div>
  )
}

function GenerationOverlay({
  state,
  error,
  sourceFilename,
  onRetry,
}: {
  state: 'generating' | 'failed'
  error: string | null
  sourceFilename: string | null
  onRetry: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-bg-base/80 backdrop-blur-sm"
    >
      <div className="relative flex flex-col items-center justify-center rounded-2xl border border-line bg-bg-surface/80 px-8 py-10 text-center shadow-float backdrop-blur">
        {state === 'generating' ? (
          <>
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
              <Sparkles size={26} className="text-white" />
              <Loader2
                size={64}
                className="absolute inset-0 animate-spin text-white/30"
              />
            </div>
            <h2 className="text-base font-semibold text-ink-100">
              AI is generating your conspect…
            </h2>
            <p className="mt-1 max-w-sm text-xs text-ink-300">
              {sourceFilename
                ? `Processing ${sourceFilename}.`
                : 'Processing your file.'}{' '}
              This usually takes 30-90 seconds. The page will refresh
              automatically.
            </p>
          </>
        ) : (
          <>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-danger-500/30 bg-danger-500/10">
              <AlertTriangle size={26} className="text-danger-400" />
            </div>
            <h2 className="text-base font-semibold text-ink-100">
              Generation failed
            </h2>
            {error ? (
              <p className="mt-1 max-w-md break-words text-xs text-danger-400">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-gradient px-3 py-1.5 text-sm font-semibold text-white shadow-glow"
            >
              Try another file
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}

function LoadingScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-bg-base">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="h-10 w-10 rounded-full border-2 border-brand-500/20 border-t-brand-400"
      />
      <p className="mt-4 text-sm text-ink-400">Loading conspect…</p>
    </div>
  )
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex h-screen items-center justify-center bg-bg-base">
      <div className="rounded-2xl border border-danger-500/30 bg-danger-500/10 p-6 text-center">
        <p className="text-sm text-danger-400">{message}</p>
      </div>
    </div>
  )
}

export default ConspectEditorPage
