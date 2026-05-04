import React, { useState, useRef, useEffect, forwardRef } from 'react'
import { BaseProps, Text } from '../types'
import {
  getColor,
  getFontSize,
  getFontWeight,
  getStylesFromBaseNode,
  getTextAlign,
} from '../lib'
import { useSelectedNode } from '../../../context/hooks/context.ts'

interface Props extends BaseProps {
  obj: Text
}

export const TextNode = forwardRef<HTMLParagraphElement, Props>(
  ({ obj, onClick, isSelected }, ref) => {
    const { updateSelectedNodeProperty } = useSelectedNode()
    const [isEditing, setIsEditing] = useState(false)
    const [text, setText] = useState(obj.htmltext ?? '')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      setText(obj.htmltext ?? '')
    }, [obj.htmltext])

    useEffect(() => {
      if (isEditing) {
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }, [isEditing])

    const handleBlur = () => {
      setIsEditing(false)
      updateSelectedNodeProperty('htmltext', text)
    }

    const style: React.CSSProperties = {
      textAlign: getTextAlign(obj.textAlign),
      fontWeight: getFontWeight(obj.fontWeight),
      ...(obj.fontColor && { color: getColor(obj.fontColor) }),
      ...(obj.fontSize && { fontSize: getFontSize(obj.fontSize) }),
      ...getStylesFromBaseNode(obj),
    }

    const base =
      'rounded-md transition-[box-shadow,transform] duration-150 cursor-pointer'
    const selection = isSelected
      ? 'ring-2 ring-brand-500 ring-offset-1 ring-offset-transparent'
      : 'ring-1 ring-transparent hover:ring-line'
    const cut = obj.cut ? 'opacity-40' : ''

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          className={`${cut} ${base} w-full rounded-md border border-brand-500/60 bg-bg-surface px-2 py-1 text-ink-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/50`}
          value={text}
          style={style}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Enter') handleBlur()
            if (e.key === 'Escape') {
              setText(obj.htmltext ?? '')
              setIsEditing(false)
            }
          }}
        />
      )
    }

    return (
      <p
        ref={ref}
        style={style}
        onDoubleClick={() => setIsEditing(true)}
        onClick={onClick}
        className={`${base} ${selection} ${cut} px-1.5 py-1`}
        dangerouslySetInnerHTML={{ __html: obj.htmltext ?? '' }}
      />
    )
  }
)

TextNode.displayName = 'TextNode'
