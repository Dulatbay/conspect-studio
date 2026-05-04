import { BaseProps, TitledContainer } from '../types'
import { forwardRef } from 'react'
import { Parser } from '../Parser.tsx'
import { getStylesFromBaseNode } from '../lib'

interface Props extends BaseProps {
  obj: TitledContainer
}

export const TitledContainerNode = forwardRef<HTMLDivElement, Props>(
  ({ obj, onClick, isSelected }, ref) => {
    const style = {
      ...getStylesFromBaseNode(obj),
    }

    const selection = isSelected
      ? 'ring-2 ring-brand-500 ring-offset-1 ring-offset-transparent'
      : 'ring-1 ring-transparent hover:ring-line'
    const cut = obj.cut ? 'opacity-40' : ''

    return (
      <div
        ref={ref}
        style={style}
        className={`flex flex-col gap-3 rounded-lg bg-bg-surface/40 p-3 transition ${selection} ${cut}`}
        onClick={onClick}
      >
        {Parser({ obj: obj.titleText })}
        <div className="border-t border-line/60 pt-3">
          {Parser({ obj: obj.content })}
        </div>
      </div>
    )
  }
)

TitledContainerNode.displayName = 'TitledContainerNode'
