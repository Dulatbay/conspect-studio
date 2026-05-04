import { normalizeConspectDto } from '../conspect/normalizeConspectFromApi.ts'
import type { ModuleDto } from './types.ts'

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' ? (v as Record<string, unknown>) : null
}

export function normalizeModuleDto(raw: unknown): ModuleDto {
  const r = asRecord(raw) ?? {}
  const conspectsRaw = r.conspects
  const conspects = Array.isArray(conspectsRaw)
    ? conspectsRaw.map((c) => normalizeConspectDto(c))
    : []
  return {
    id: String(r.id ?? ''),
    title: String(r.title ?? ''),
    description: (r.description as string) ?? null,
    position: Number(r.position ?? 0),
    conspects,
    createdDate: (r.createdDate ?? r.created_date) as string | null | undefined,
    lastModifiedDate: (r.lastModifiedDate ?? r.last_modified_date) as
      | string
      | null
      | undefined,
  }
}
