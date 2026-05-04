import type { ConspectDto, ConspectPage } from './types.ts'

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' ? (v as Record<string, unknown>) : null
}

/** Maps Spring / Pydantic snake_case conspect JSON to app camelCase. */
export function normalizeConspectDto(raw: unknown): ConspectDto {
  const r = asRecord(raw) ?? {}
  return {
    id: String(r.id ?? ''),
    title: (r.title as string) ?? null,
    moduleId: (r.moduleId ?? r.module_id) as string | null | undefined,
    position: r.position as number | undefined,
    isGenerating:
      r.isGenerating === true ||
      r.is_generating === true ||
      r.generating === true,
    aiJobId: (r.aiJobId ?? r.ai_job_id) as string | null | undefined,
    aiError: (r.aiError ?? r.ai_error) as string | null | undefined,
    sourceFilename: (r.sourceFilename ?? r.source_filename) as
      | string
      | null
      | undefined,
    contentKaz: (r.contentKaz ?? r.content_kaz) as ConspectDto['contentKaz'],
    contentRu: (r.contentRu ?? r.content_ru) as ConspectDto['contentRu'],
    contentEng: (r.contentEng ?? r.content_eng) as ConspectDto['contentEng'],
    contentCurrentLanguage: (r.contentCurrentLanguage ??
      r.content_current_language) as ConspectDto['contentCurrentLanguage'],
    createdDate: (r.createdDate ?? r.created_date) as string | null | undefined,
    lastModifiedDate: (r.lastModifiedDate ?? r.last_modified_date) as
      | string
      | null
      | undefined,
  }
}

export function normalizeConspectPage(raw: unknown): ConspectPage {
  const r = asRecord(raw) ?? {}
  const content = Array.isArray(r.content)
    ? r.content.map((item) => normalizeConspectDto(item))
    : []
  return {
    content,
    totalElements: (r.totalElements ?? r.total_elements) as number | undefined,
  }
}
