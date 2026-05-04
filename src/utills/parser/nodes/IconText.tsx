import { BaseProps, IconText as IconTextType } from '../types'
import React, { forwardRef } from 'react'
import { getStylesFromBaseNode } from '../lib'
import { Parser } from '../Parser.tsx'

interface Props extends BaseProps {
  obj: IconTextType
}

export const IconText = forwardRef<HTMLDivElement, Props>(
  ({ obj, isSelected, onClick }, ref) => {
    const style: React.CSSProperties = {
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
        className={`flex items-center gap-3 rounded-md px-2 py-1 transition ${selection} ${cut}`}
        onClick={onClick}
      >
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-lg">
          {obj.icon}
        </span>
        <div className="min-w-0 flex-1">{Parser({ obj: obj.text })}</div>
      </div>
    )
  }
)

IconText.displayName = 'IconText'
