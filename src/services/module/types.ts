import type { ConspectSummary } from '../conspect/types.ts'

export interface ModuleDto {
  id: string
  title: string
  description?: string | null
  position: number
  conspects: ConspectSummary[]
  createdDate?: string | null
  lastModifiedDate?: string | null
}
