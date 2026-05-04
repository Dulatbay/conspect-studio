import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Trash2,
  Boxes,
  Type as TypeIcon,
  Rows3,
  Sparkle as SparkleIcon,
  Sliders,
  Palette,
} from 'lucide-react'
import {
  AlignSelf,
  Background,
  BorderType,
  FontColor,
  FontSize,
  TextAlign,
  BaseNode,
  Stack,
  TitledContainer,
  Text,
  CenteredContainer,
  IconText,
  Image,
  Video,
  FontWeight,
  JustifyContent,
  AlignItems,
  FlexWrap,
  NodeType,
} from '../utills/parser/types.ts'
import {
  isTextNode,
  isStackNode,
  isIconText,
  isImage,
  isVideo,
  isCenteredContainer,
} from '../utills/parser/Parser.tsx'
import { useSelectedNode } from '../context/hooks/context.ts'
import IconPicker from './IconPicker.tsx'
import { makeText } from '../lib/nodeTemplates.ts'

interface Props {
  selectedNode: BaseNode
  handleChange: <
    T extends keyof (BaseNode &
      Stack &
      TitledContainer &
      Text &
      CenteredContainer &
      IconText &
      Image &
      Video)
  >(
    key: T,
    value: unknown
  ) => void
}

function Section({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-300 transition hover:bg-bg-elevated"
      >
        <span className="inline-flex items-center gap-2">
          {icon}
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronDown size={14} className="text-ink-400" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-ink-400">
        {label}
      </span>
      {children}
    </label>
  )
}

function TextInput(props: {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  step?: number | string
  min?: number | string
  max?: number | string
}) {
  return (
    <input
      type={props.type ?? 'text'}
      value={props.value}
      placeholder={props.placeholder}
      step={props.step}
      min={props.min}
      max={props.max}
      onChange={(e) => props.onChange(e.target.value)}
      onKeyDown={(e) => e.stopPropagation()}
      className="w-full rounded-md border border-line bg-bg-surface px-2.5 py-1.5 text-xs text-ink-100 transition focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
    />
  )
}

function SelectChips({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => {
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={[
              'rounded-md px-2 py-1 text-[11px] font-medium transition',
              active
                ? 'bg-brand-500/20 text-brand-200 ring-1 ring-brand-500/40'
                : 'border border-line text-ink-300 hover:bg-bg-elevated hover:text-ink-100',
            ].join(' ')}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function Slider({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-brand-500"
      />
      <span className="w-10 text-right font-mono text-xs text-ink-300">
        {Number.isFinite(value) ? value.toFixed(2) : '1.00'}
      </span>
    </div>
  )
}

function TextareaField({ selectedNode, handleChange }: {
  selectedNode: Text
  handleChange: Props['handleChange']
}) {
  const [text, setText] = useState(selectedNode.htmltext ?? '')

  useEffect(() => {
    setText(selectedNode.htmltext ?? '')
  }, [selectedNode.id, selectedNode.htmltext])

  return (
    <Field label="HTML text">
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          handleChange('htmltext' as keyof Text, e.target.value)
        }}
        onKeyDown={(e) => e.stopPropagation()}
        rows={4}
        className="w-full resize-y rounded-md border border-line bg-bg-surface px-2.5 py-2 font-mono text-xs text-ink-100 transition focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
      />
    </Field>
  )
}

function BaseStyle({ selectedNode, handleChange }: Props) {
  return (
    <>
      <Field label="Background">
        <SelectChips
          value={selectedNode.background || 'NONE'}
          onChange={(v) => handleChange('background', v)}
          options={Object.values(Background)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Border color">
          <SelectChips
            value={selectedNode.borderColor || 'DEFAULT'}
            onChange={(v) => handleChange('borderColor', v)}
            options={Object.values(FontColor)}
          />
        </Field>
        <Field label="Border type">
          <SelectChips
            value={selectedNode.borderType || 'NONE'}
            onChange={(v) => handleChange('borderType', v)}
            options={Object.values(BorderType)}
          />
        </Field>
      </div>
      <Field label="Border radius">
        <TextInput
          value={selectedNode.borderRadius || ''}
          onChange={(v) => handleChange('borderRadius', v)}
          placeholder="8px · 1rem · 50%"
        />
      </Field>
      <Field label="Align self">
        <SelectChips
          value={selectedNode.alignSelf || 'AUTO'}
          onChange={(v) => handleChange('alignSelf', v)}
          options={Object.values(AlignSelf)}
        />
      </Field>
      <Field label="Opacity">
        <Slider
          min={0}
          max={1}
          step={0.05}
          value={selectedNode.opacity == null ? 1 : Number(selectedNode.opacity)}
          onChange={(v) => handleChange('opacity', v)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Padding">
          <TextInput
            value={selectedNode.padding || ''}
            onChange={(v) => handleChange('padding', v)}
            placeholder="12px"
          />
        </Field>
        <Field label="Margin">
          <TextInput
            value={selectedNode.margin || ''}
            onChange={(v) => handleChange('margin', v)}
            placeholder="0"
          />
        </Field>
        <Field label="Width">
          <TextInput
            value={selectedNode.width || ''}
            onChange={(v) => handleChange('width', v)}
          />
        </Field>
        <Field label="Height">
          <TextInput
            value={selectedNode.height || ''}
            onChange={(v) => handleChange('height', v)}
          />
        </Field>
        <Field label="Min width">
          <TextInput
            value={selectedNode.minWidth || ''}
            onChange={(v) => handleChange('minWidth', v)}
          />
        </Field>
        <Field label="Min height">
          <TextInput
            value={selectedNode.minHeight || ''}
            onChange={(v) => handleChange('minHeight', v)}
          />
        </Field>
      </div>
    </>
  )
}

function TextStyle({ selectedNode, handleChange }: Props) {
  const text = selectedNode as Text
  return (
    <>
      <Field label="Font color">
        <SelectChips
          value={text.fontColor || 'DEFAULT'}
          onChange={(v) => handleChange('fontColor', v)}
          options={Object.values(FontColor)}
        />
      </Field>
      <Field label="Font size">
        <SelectChips
          value={text.fontSize || 'SMALL'}
          onChange={(v) => handleChange('fontSize', v)}
          options={Object.values(FontSize)}
        />
      </Field>
      <Field label="Text align">
        <SelectChips
          value={text.textAlign || 'LEFT'}
          onChange={(v) => handleChange('textAlign', v)}
          options={Object.values(TextAlign)}
        />
      </Field>
      <Field label="Font weight">
        <SelectChips
          value={text.fontWeight || 'REGULAR'}
          onChange={(v) => handleChange('fontWeight', v)}
          options={Object.values(FontWeight)}
        />
      </Field>
      <TextareaField selectedNode={text} handleChange={handleChange} />
    </>
  )
}

function StackStyle({ selectedNode, handleChange }: Props) {
  const stack = selectedNode as Stack
  return (
    <>
      <Field label="Direction">
        <SelectChips
          value={stack.vertical ? 'Vertical' : 'Horizontal'}
          onChange={(v) => handleChange('vertical', v === 'Vertical')}
          options={['Vertical', 'Horizontal']}
        />
      </Field>
      <Field label="Gap (px)">
        <TextInput
          type="number"
          value={stack.gap?.toString() || ''}
          onChange={(v) => handleChange('gap', Number(v))}
          placeholder="0"
        />
      </Field>
      <Field label="Justify content">
        <SelectChips
          value={stack.justifyContent || 'CENTER'}
          onChange={(v) => handleChange('justifyContent', v)}
          options={Object.values(JustifyContent)}
        />
      </Field>
      <Field label="Align items">
        <SelectChips
          value={stack.alignItems || 'START'}
          onChange={(v) => handleChange('alignItems', v)}
          options={Object.values(AlignItems)}
        />
      </Field>
      <Field label="Wrap">
        <SelectChips
          value={stack.flexWrap || 'NOWRAP'}
          onChange={(v) => handleChange('flexWrap', v)}
          options={Object.values(FlexWrap)}
        />
      </Field>
    </>
  )
}

function IconTextStyle({ selectedNode, handleChange }: Props) {
  const it = selectedNode as IconText
  return (
    <Field label="Icon">
      <IconPicker
        value={it.icon || ''}
        onChange={(v) => handleChange('icon', v)}
      />
    </Field>
  )
}

function ImageStyle({ selectedNode, handleChange }: Props) {
  const img = selectedNode as Image
  return (
    <>
      <Field label="Image URL">
        <TextInput
          value={img.url || ''}
          onChange={(v) => handleChange('url', v)}
          placeholder="https://…"
        />
      </Field>
      <Field label="Alt text">
        <TextInput
          value={img.alt || ''}
          onChange={(v) => handleChange('alt', v)}
          placeholder="Description for accessibility"
        />
      </Field>
      {img.url && (
        <div className="overflow-hidden rounded-md border border-line bg-bg-surface/60">
          <img
            src={img.url}
            alt={img.alt ?? ''}
            className="block max-h-32 w-full object-contain"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}
    </>
  )
}

function VideoStyle({ selectedNode, handleChange }: Props) {
  const v = selectedNode as Video
  const Toggle = ({
    label,
    valueKey,
    checked,
  }: {
    label: string
    valueKey: keyof Video
    checked: boolean
  }) => (
    <button
      type="button"
      onClick={() => handleChange(valueKey as keyof Video, !checked)}
      className={[
        'flex items-center justify-between rounded-md border px-2 py-1.5 text-[11px] transition',
        checked
          ? 'border-brand-500/50 bg-brand-500/10 text-ink-100'
          : 'border-line bg-bg-surface text-ink-300 hover:bg-bg-elevated',
      ].join(' ')}
    >
      <span>{label}</span>
      <span
        className={[
          'inline-block h-3 w-5 rounded-full transition',
          checked ? 'bg-brand-400' : 'bg-line',
        ].join(' ')}
      >
        <span
          className={[
            'block h-3 w-3 rounded-full bg-white transition',
            checked ? 'translate-x-2' : 'translate-x-0',
          ].join(' ')}
        />
      </span>
    </button>
  )
  return (
    <>
      <Field label="Video URL">
        <TextInput
          value={v.url || ''}
          onChange={(val) => handleChange('url', val)}
          placeholder="https://…/video.mp4"
        />
      </Field>
      <Field label="Poster URL">
        <TextInput
          value={v.poster || ''}
          onChange={(val) => handleChange('poster', val)}
          placeholder="https://…/poster.jpg"
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Toggle label="Autoplay" valueKey="autoplay" checked={!!v.autoplay} />
        <Toggle label="Loop" valueKey="loop" checked={!!v.loop} />
        <Toggle label="Muted" valueKey="muted" checked={!!v.muted} />
        <Toggle label="Controls" valueKey="controls" checked={!!v.controls} />
      </div>
    </>
  )
}

function CenteredFlipStyle({ selectedNode, handleChange }: Props) {
  const cc = selectedNode as CenteredContainer
  const flippable = !!cc.flippable
  return (
    <>
      <button
        type="button"
        onClick={() => {
          const next = !flippable
          handleChange('flippable', next)
          if (next && !cc.backChildNode) {
            handleChange('backChildNode', makeText('Back side'))
          }
        }}
        className={[
          'flex w-full items-center justify-between rounded-md border px-2.5 py-1.5 text-xs transition',
          flippable
            ? 'border-brand-500/50 bg-brand-500/10 text-ink-100'
            : 'border-line bg-bg-surface text-ink-300 hover:bg-bg-elevated',
        ].join(' ')}
      >
        <span>Click to flip</span>
        <span
          className={[
            'inline-block h-3.5 w-7 rounded-full transition',
            flippable ? 'bg-brand-400' : 'bg-line',
          ].join(' ')}
        >
          <span
            className={[
              'block h-3.5 w-3.5 rounded-full bg-white shadow transition',
              flippable ? 'translate-x-3.5' : 'translate-x-0',
            ].join(' ')}
          />
        </span>
      </button>
      {flippable && (
        <p className="text-[11px] text-ink-400">
          Edit the back side from the Outline tree — it appears as a sibling
          under this Centered container.
        </p>
      )}
      {flippable && cc.backChildNode?.nodeType !== NodeType.TEXT && (
        <button
          type="button"
          onClick={() => handleChange('backChildNode', makeText('Back side'))}
          className="rounded-md border border-line px-2 py-1 text-[11px] text-ink-300 transition hover:bg-bg-elevated hover:text-ink-100"
        >
          Reset back side to text
        </button>
      )}
    </>
  )
}

function typeBadge(nodeType: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    TEXT: { bg: 'bg-brand-500/15', text: 'text-brand-200', label: 'Text' },
    STACK: { bg: 'bg-accent-500/15', text: 'text-accent-400', label: 'Stack' },
    TITLED_CONTAINER: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-300',
      label: 'Titled',
    },
    CENTERED_CONTAINER: {
      bg: 'bg-sky-500/15',
      text: 'text-sky-300',
      label: 'Centered',
    },
    ICON_TEXT: {
      bg: 'bg-fuchsia-500/15',
      text: 'text-fuchsia-300',
      label: 'IconText',
    },
    IMAGE: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-300',
      label: 'Image',
    },
    VIDEO: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-300',
      label: 'Video',
    },
  }
  return (
    map[nodeType] ?? {
      bg: 'bg-ink-500/20',
      text: 'text-ink-200',
      label: nodeType,
    }
  )
}

const PropertiesBar = () => {
  const {
    selectedNodeData,
    updateSelectedNodeProperty,
    handleDeleteNode,
    isDeletable,
  } = useSelectedNode()

  if (!selectedNodeData) {
    return (
      <div className="flex h-full items-center justify-center bg-bg-panel/80 p-6 text-center backdrop-blur">
        <div className="max-w-xs">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-bg-surface">
            <Boxes size={18} className="text-ink-400" />
          </div>
          <p className="text-sm font-semibold text-ink-200">
            Nothing selected
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Click any block on the canvas or in the tree to inspect its
            properties.
          </p>
        </div>
      </div>
    )
  }

  const handleChange = <
    T extends keyof (BaseNode &
      Stack &
      TitledContainer &
      Text &
      CenteredContainer &
      IconText &
      Image)
  >(
    key: T,
    value: unknown
  ) => {
    updateSelectedNodeProperty(key, value)
  }

  const badge = typeBadge(selectedNodeData.nodeType)

  return (
    <div className="flex h-full min-w-[280px] flex-col overflow-hidden bg-bg-panel/80 backdrop-blur">
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${badge.bg} ${badge.text}`}
          >
            {badge.label}
          </span>
          {isDeletable && (
            <button
              type="button"
              onClick={handleDeleteNode}
              className="inline-flex items-center gap-1.5 rounded-md border border-danger-500/30 px-2 py-1 text-[11px] text-danger-400 transition hover:bg-danger-500/10"
              title="Delete (Del)"
            >
              <Trash2 size={11} />
              Delete
            </button>
          )}
        </div>
        <p className="mt-2 truncate font-mono text-[11px] text-ink-500">
          {selectedNodeData.id}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Section title="Layout" icon={<Sliders size={12} />} defaultOpen>
          <BaseStyle
            selectedNode={selectedNodeData}
            handleChange={handleChange}
          />
        </Section>

        {isTextNode(selectedNodeData) && (
          <Section title="Text" icon={<TypeIcon size={12} />} defaultOpen>
            <TextStyle
              selectedNode={selectedNodeData}
              handleChange={handleChange}
            />
          </Section>
        )}

        {isStackNode(selectedNodeData) && (
          <Section title="Stack" icon={<Rows3 size={12} />} defaultOpen>
            <StackStyle
              selectedNode={selectedNodeData}
              handleChange={handleChange}
            />
          </Section>
        )}

        {isIconText(selectedNodeData) && (
          <Section title="Icon" icon={<SparkleIcon size={12} />} defaultOpen>
            <IconTextStyle
              selectedNode={selectedNodeData}
              handleChange={handleChange}
            />
          </Section>
        )}

        {isImage(selectedNodeData) && (
          <Section title="Image" icon={<Sliders size={12} />} defaultOpen>
            <ImageStyle
              selectedNode={selectedNodeData}
              handleChange={handleChange}
            />
          </Section>
        )}

        {isVideo(selectedNodeData) && (
          <Section title="Video" icon={<Sliders size={12} />} defaultOpen>
            <VideoStyle
              selectedNode={selectedNodeData}
              handleChange={handleChange}
            />
          </Section>
        )}

        {isCenteredContainer(selectedNodeData) && (
          <Section
            title="Flip card"
            icon={<SparkleIcon size={12} />}
            defaultOpen
          >
            <CenteredFlipStyle
              selectedNode={selectedNodeData}
              handleChange={handleChange}
            />
          </Section>
        )}

        <Section title="Shortcuts" icon={<Palette size={12} />}>
          <ul className="space-y-1 text-[11px] text-ink-400">
            <li>• Enter in inputs — commit</li>
            <li>• Double-click text on canvas — quick edit</li>
            <li>• Drag blocks from the «Blocks» tab on the left</li>
          </ul>
        </Section>
      </div>
    </div>
  )
}

export default PropertiesBar
