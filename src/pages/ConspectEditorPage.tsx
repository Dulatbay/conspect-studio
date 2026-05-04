import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Split from 'react-split'
import { motion } from 'framer-motion'
import {
  useGetConspectQuery,
  useUpdateConspectMutation,
} from '../services/conspect/api.ts'
import { useSelectedNode } from '../context/hooks/context.ts'
import { pickConspectContent } from '../lib/pickConspectContent.ts'
import { createDefaultRootTree } from '../lib/defaultRoot.ts'
import AppHeader from '../components/AppHeader.tsx'
import SidePanel from '../components/SidePanel.tsx'
import MainDrawBar from '../components/MainDrawBar.tsx'
import PropertiesBar from '../components/PropertiesBar.tsx'

const ConspectEditorPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isFetching, error, refetch } = useGetConspectQuery(
    id ?? '',
    { skip: !id }
  )
  const [updateConspect, { isLoading: isRenaming }] = useUpdateConspectMutation()

  const {
    fullData,
    setFullData,
    reset,
    setConspectSession,
    setSelectedNodeData,
    handleIsSaved,
  } = useSelectedNode()

  const loadedIdRef = useRef<string | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    loadedIdRef.current = null
    setIsBootstrapping(true)
    reset()
  }, [id, reset])

  useEffect(() => {
    if (!data || !id) return
    if (loadedIdRef.current === id) return
    loadedIdRef.current = id
    const content = pickConspectContent(data) ?? createDefaultRootTree()
    setFullData(content)
    setConspectSession({ id, title: data.title })
    setSelectedNodeData(content)
    handleIsSaved(true)
    setIsBootstrapping(false)
  }, [
    data,
    id,
    setFullData,
    setConspectSession,
    setSelectedNodeData,
    handleIsSaved,
  ])

  const handleReset = async () => {
    const result = await refetch()
    if (!id || !result.data) return
    const content = pickConspectContent(result.data) ?? createDefaultRootTree()
    loadedIdRef.current = id
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

  if (!id) {
    return <ErrorScreen message="Conspect id is missing" />
  }

  if ((isLoading || isBootstrapping || !fullData) && !error) {
    return <LoadingScreen />
  }

  if (error) {
    return <ErrorScreen message="Failed to load the conspect" />
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-bg-base">
      <AppHeader
        onReset={handleReset}
        onRenameTitle={handleRenameTitle}
        isSaving={isRenaming || isFetching}
      />

      <div className="relative flex-1 min-h-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 bg-radial-fade" />
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
      </div>
    </div>
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
