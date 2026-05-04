import { v4 as uuidv4 } from 'uuid'
import { CONSPECT_ICONS } from './conspectIcons'
import {
  AlignItems,
  CenteredContainer,
  FlexWrap,
  FontColor,
  FontSize,
  FontWeight,
  IconText,
  Image as ImageType,
  JustifyContent,
  NodeType,
  Stack,
  Text,
  TextAlign,
  TitledContainer,
  Video as VideoType,
  type BaseNode,
} from '../utills/parser/types'

export function makeText(
  htmltext = 'New text',
  fontSize: FontSize = FontSize.SMALL
): Text {
  return {
    id: uuidv4(),
    nodeType: NodeType.TEXT,
    htmltext,
    fontSize,
    textAlign: TextAlign.LEFT,
    fontColor: FontColor.DEFAULT,
    fontWeight: FontWeight.REGULAR,
  }
}

export function makeStack(children: BaseNode[] = [], vertical = true): Stack {
  return {
    id: uuidv4(),
    nodeType: NodeType.STACK,
    vertical,
    gap: 12,
    flexWrap: FlexWrap.NOWRAP,
    justifyContent: JustifyContent.CENTER,
    alignItems: AlignItems.START,
    children,
  }
}

export function makeTitledContainer(content?: BaseNode): TitledContainer {
  return {
    id: uuidv4(),
    nodeType: NodeType.TITLED_CONTAINER,
    titleText: makeText('Title', FontSize.MEDIUM),
    isDivided: false,
    content: content ?? makeText('Content'),
  }
}

export function makeCenteredContainer(childNode?: BaseNode): CenteredContainer {
  return {
    id: uuidv4(),
    nodeType: NodeType.CENTERED_CONTAINER,
    childNode: childNode ?? makeText('Centered content'),
  }
}

export function makeIconText(): IconText {
  return {
    id: uuidv4(),
    nodeType: NodeType.ICON_TEXT,
    icon: CONSPECT_ICONS.GLOWING_STAR,
    text: makeText('Text with icon'),
  }
}

export function makeImage(url = ''): ImageType {
  return {
    id: uuidv4(),
    nodeType: NodeType.IMAGE,
    url,
    alt: '',
    width: '320px',
  }
}

export function makeVideo(url = ''): VideoType {
  return {
    id: uuidv4(),
    nodeType: NodeType.VIDEO,
    url,
    autoplay: false,
    loop: false,
    muted: true,
    controls: false,
    width: '480px',
  }
}

export function makeByType(type: NodeType, child?: BaseNode): BaseNode {
  switch (type) {
    case NodeType.TEXT:
      return makeText()
    case NodeType.STACK:
      return makeStack()
    case NodeType.TITLED_CONTAINER:
      return makeTitledContainer(child)
    case NodeType.CENTERED_CONTAINER:
      return makeCenteredContainer(child)
    case NodeType.ICON_TEXT:
      return makeIconText()
    case NodeType.IMAGE:
      return makeImage()
    case NodeType.VIDEO:
      return makeVideo()
    default:
      return { id: uuidv4(), nodeType: type } as BaseNode
  }
}

export type BlockKind =
  | 'text-h'
  | 'text'
  | 'stack-v'
  | 'stack-h'
  | 'titled'
  | 'centered'
  | 'icon-text'
  | 'image'
  | 'video'

export interface BlockTemplate {
  kind: BlockKind
  label: string
  description: string
  icon: string
  build: () => BaseNode
}

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  {
    kind: 'text-h',
    label: 'Heading',
    description: 'Large text',
    icon: 'heading',
    build: () => makeText('Heading', FontSize.BIG),
  },
  {
    kind: 'text',
    label: 'Text',
    description: 'HTML paragraph',
    icon: 'type',
    build: () => makeText('New text', FontSize.SMALL),
  },
  {
    kind: 'stack-v',
    label: 'Stack ↕',
    description: 'Vertical column',
    icon: 'rows',
    build: () => makeStack([], true),
  },
  {
    kind: 'stack-h',
    label: 'Stack ↔',
    description: 'Horizontal row',
    icon: 'cols',
    build: () => makeStack([], false),
  },
  {
    kind: 'titled',
    label: 'Card',
    description: 'Title + content',
    icon: 'layout',
    build: () => makeTitledContainer(),
  },
  {
    kind: 'centered',
    label: 'Center',
    description: 'Centers the nested node',
    icon: 'circle',
    build: () => makeCenteredContainer(),
  },
  {
    kind: 'icon-text',
    label: 'Icon + text',
    description: 'Bulleted list item',
    icon: 'sparkle',
    build: () => makeIconText(),
  },
  {
    kind: 'image',
    label: 'Image',
    description: 'Picture from a URL',
    icon: 'image',
    build: () => makeImage(),
  },
  {
    kind: 'video',
    label: 'Video',
    description: 'Click to play',
    icon: 'video',
    build: () => makeVideo(),
  },
]

export const BLOCK_MIME = 'application/x-conspect-block'
