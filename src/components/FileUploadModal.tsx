import { AnimatePresence, motion } from 'framer-motion'
import { FileUp, Loader2, UploadCloud, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ConspectLanguage } from '../services/conspect/types'

const LANGUAGES: { value: ConspectLanguage; label: string }[] = [
  { value: 'RU', label: 'Russian' },
  { value: 'KAZ', label: 'Kazakh' },
  { value: 'ENG', label: 'English' },
]

const ACCEPT = '.pdf,.docx,.xlsx,.txt,.md,application/pdf'

interface FileUploadModalProps {
  isOpen: boolean
  title: string
  description?: string
  submitLabel?: string
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (input: { file: File; language: ConspectLanguage }) => Promise<void> | void
}

export default function FileUploadModal({
  isOpen,
  title,
  description,
  submitLabel = 'Upload',
  isSubmitting = false,
  onClose,
  onSubmit,
}: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [language, setLanguage] = useState<ConspectLanguage>('RU')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setFile(null)
      setLanguage('RU')
      setIsDragging(false)
      setError(null)
    }
  }, [isOpen])

  const handlePickFile = (next: File | null) => {
    if (!next) {
      setFile(null)
      return
    }
    if (next.size === 0) {
      setError('File is empty')
      return
    }
    setError(null)
    setFile(next)
  }

  const handleSubmit = async () => {
    if (!file || isSubmitting) return
    try {
      await onSubmit({ file, language })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Upload failed, please try again'
      setError(message)
    }
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => (!isSubmitting ? onClose() : undefined)}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-bg-surface p-6 shadow-float"
          >
            <button
              type="button"
              onClick={() => (!isSubmitting ? onClose() : undefined)}
              disabled={isSubmitting}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-400 transition hover:bg-bg-elevated hover:text-ink-100 disabled:opacity-40"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
                <UploadCloud size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-ink-100">{title}</h2>
                {description ? (
                  <p className="mt-1 text-xs text-ink-300">{description}</p>
                ) : null}
              </div>
            </div>

            <label
              htmlFor="upload-file"
              onDragOver={(e) => {
                e.preventDefault()
                if (!isSubmitting) setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                if (isSubmitting) return
                const next = e.dataTransfer.files?.[0]
                if (next) handlePickFile(next)
              }}
              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
                isDragging
                  ? 'border-brand-400 bg-brand-500/10'
                  : 'border-line bg-bg-base/40 hover:border-line-strong hover:bg-bg-elevated/40'
              }`}
            >
              <input
                ref={inputRef}
                id="upload-file"
                type="file"
                className="sr-only"
                accept={ACCEPT}
                disabled={isSubmitting}
                onChange={(e) => handlePickFile(e.target.files?.[0] ?? null)}
              />
              <FileUp size={22} className="mb-2 text-brand-300" />
              {file ? (
                <>
                  <p className="text-sm font-medium text-ink-100">{file.name}</p>
                  <p className="mt-1 text-xs text-ink-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-ink-100">
                    Drop a file or click to upload
                  </p>
                  <p className="mt-1 text-xs text-ink-400">
                    PDF, DOCX, XLSX, TXT, MD
                  </p>
                </>
              )}
            </label>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-ink-300">
                Language
              </label>
              <div className="flex gap-1.5">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setLanguage(l.value)}
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      language === l.value
                        ? 'border-brand-500 bg-brand-500/15 text-brand-200'
                        : 'border-line bg-bg-base/40 text-ink-300 hover:border-line-strong hover:text-ink-100'
                    } disabled:opacity-50`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <p className="mt-3 rounded-lg border border-danger-500/30 bg-danger-500/10 px-3 py-2 text-xs text-danger-400">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg border border-line bg-bg-surface px-3 py-1.5 text-sm text-ink-200 transition hover:border-line-strong hover:bg-bg-elevated disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!file || isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-gradient px-3 py-1.5 text-sm font-semibold text-white shadow-glow transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UploadCloud size={14} />
                )}
                {submitLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
