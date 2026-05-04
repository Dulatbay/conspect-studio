import { createContext, useContext } from 'react'
import { BaseNode, Stack, TitledContainer } from '../../utills/parser/types.ts'

export interface ConspectSession {
  id: string
  title?: string | null
}

interface SelectedNodeContextProps {
  selectedNodeData: BaseNode | null
  fullData: BaseNode | null
  isSaved: boolean
  setSelectedNodeData: (BaseNode: BaseNode | null) => void
  updateSelectedNodeProperty: (
    key: keyof (BaseNode & Stack & TitledContainer),
    value: unknown
  ) => void
  saveFullData: () => void
  setFullData: (obj: BaseNode | null) => void
  handleDeleteNode: () => void
  isDeletable: boolean
  addNodeToSelectedStack: (newNode: BaseNode) => void
  addNodeToStackById: (parentId: string, newNode: BaseNode, index?: number) => boolean
  isAvailableToAdd: boolean
  handleIsSaved: (isSaved: boolean) => void
  reset: () => void
  conspectSession: ConspectSession | null
  setConspectSession: (session: ConspectSession | null) => void
  moveNodeUpDown: (direction: 'up' | 'down') => void
  moveNode: (
    draggedNodeId: string,
    targetNodeId: string,
    dropPosition: 'before' | 'after' | 'inside'
  ) => void
}

export const SelectedNodeContext = createContext<
  SelectedNodeContextProps | undefined
>(undefined)

export const useSelectedNode = () => {
  const context = useContext(SelectedNodeContext)
  if (!context) {
    throw new Error('useSelectedNode must be used within a SelectedNodeProvider')
  }
  return context
}
