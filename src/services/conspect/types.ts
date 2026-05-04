import type { BaseNode } from '../../utills/parser/types.ts'

export interface ConspectDto {
  id: string
  title?: string | null
  moduleId?: string | null
  position?: number
  isGenerating?: boolean
  aiJobId?: string | null
  aiError?: string | null
  sourceFilename?: string | null
  contentKaz?: BaseNode
  contentRu?: BaseNode
  contentEng?: BaseNode
  contentCurrentLanguage?: BaseNode
  createdDate?: string | null
  lastModifiedDate?: string | null
}

export interface ConspectSummary {
  id: string
  title?: string | null
  moduleId?: string | null
  position?: number
  isGenerating?: boolean
  aiError?: string | null
  sourceFilename?: string | null
  createdDate?: string | null
  lastModifiedDate?: string | null
}

export interface ConspectPage {
  content: ConspectSummary[]
  totalElements?: number
}

export type ConspectLanguage = 'KAZ' | 'RU' | 'ENG'
