import { v4 as uuidv4 } from 'uuid'
import {
  AlignItems,
  FlexWrap,
  FontColor,
  FontSize,
  FontWeight,
  JustifyContent,
  NodeType,
  TextAlign,
  type BaseNode,
  type Stack,
  type Text,
} from '../utills/parser/types.ts'

export function createDefaultRootTree(): BaseNode {
  const textId = uuidv4()
  const text: Text = {
    id: textId,
    nodeType: NodeType.TEXT,
    fontSize: FontSize.MEDIUM,
    htmltext: '<p>Empty conspect — drop blocks here</p>',
    textAlign: TextAlign.LEFT,
    fontColor: FontColor.DEFAULT,
    fontWeight: FontWeight.REGULAR,
  }
  const stack: Stack = {
    id: uuidv4(),
    nodeType: NodeType.STACK,
    vertical: true,
    gap: 16,
    flexWrap: FlexWrap.NOWRAP,
    justifyContent: JustifyContent.CENTER,
    alignItems: AlignItems.CENTER,
    children: [text],
  }
  return stack
}
