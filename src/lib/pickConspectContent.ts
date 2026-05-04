import type { BaseNode } from '../utills/parser/types.ts'
import type { ConspectDto } from '../services/conspect/types.ts'

export function pickConspectContent(dto: ConspectDto): BaseNode | null {
  return (
    dto.contentRu ??
    dto.contentKaz ??
    dto.contentEng ??
    dto.contentCurrentLanguage ??
    null
  )
}
