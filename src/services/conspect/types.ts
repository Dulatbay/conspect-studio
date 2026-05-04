import type { BaseNode } from '../../utills/parser/types.ts'

export interface ConspectDto {
  id: string
  title?: string | null
  contentKaz?: BaseNode
  contentRu?: BaseNode
  contentEng?: BaseNode
  contentCurrentLanguage?: BaseNode
}

export interface ConspectSummary {
  id: string
  title?: string | null
}

export interface ConspectPage {
  content: ConspectSummary[]
  totalElements?: number
}
