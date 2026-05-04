import React from "react";
import {
    BaseNode,
    CenteredContainer,
    IconText as IconTextType,
    Image as ImageType,
    Link,
    NodeType,
    Stack,
    Text,
    TitledContainer,
    Video as VideoType,
} from "./types";
import StackNode from "./nodes/StackNode";
import {TextNode} from "./nodes/TextNode";
import {IconText} from "./nodes/IconText";
import {TitledContainerNode} from "./nodes/TitledContainerNode";
import CenteredContainerNode from "./nodes/CenteredContainerNode";
import ImageNode from "./nodes/ImageNode";
import VideoNode from "./nodes/VideoNode";
import DraggableSibling from "./DraggableSibling";
import {ArcherElement} from "react-archer";
import {useSelectedNode} from "../../context/hooks/context.ts";

export const isStackNode = (node: BaseNode): node is Stack => node?.nodeType === NodeType.STACK;
export const isTextNode = (node: BaseNode): node is Text => node?.nodeType === NodeType.TEXT;
export const isIconText = (node: BaseNode): node is IconTextType => node?.nodeType === NodeType.ICON_TEXT;
export const isTitledContainer = (node: BaseNode): node is TitledContainer => node?.nodeType === NodeType.TITLED_CONTAINER;
export const isCenteredContainer = (node: BaseNode): node is CenteredContainer => node?.nodeType === NodeType.CENTERED_CONTAINER;
export const isImage = (node: BaseNode): node is ImageType => node?.nodeType === NodeType.IMAGE;
export const isVideo = (node: BaseNode): node is VideoType => node?.nodeType === NodeType.VIDEO;

interface ParserProps {
    obj: BaseNode;
}

export const Parser = ({obj}: ParserProps): React.ReactNode => {
    const {selectedNodeData, setSelectedNodeData} = useSelectedNode();

    if (!obj) return null;

    const handleClick = (e: React.MouseEvent, node: BaseNode) => {
        e.stopPropagation();
        setSelectedNodeData(node);
    };

    const renderStackChildren = (parent: Stack) => {
        return parent.children?.map((child) => (
            <DraggableSibling
                key={child.id}
                childId={child.id}
                parentId={parent.id}
                vertical={parent.vertical}
            >
                <Parser obj={child} />
            </DraggableSibling>
        ));
    };

    const isSelected = selectedNodeData?.id === obj.id;
    const relations = (links?: Link[]) =>
        links?.filter((l) => l.fromId === obj.id).map((link: Link) => ({
            targetId: link.toId,
            sourceAnchor: 'bottom' as const,
            targetAnchor: 'top' as const,
        })) || [];

    if (isStackNode(obj)) {
        return (
            <ArcherElement key={obj.id} id={obj.id} relations={relations(obj.links)}>
                <StackNode
                    obj={obj}
                    isSelected={isSelected}
                    onClick={(e) => handleClick(e, obj)}
                >
                    {renderStackChildren(obj)}
                </StackNode>
            </ArcherElement>
        );
    }

    if (isTextNode(obj)) {
        return (
            <ArcherElement key={obj.id} id={obj.id}>
                <TextNode obj={obj} isSelected={isSelected} onClick={(e) => handleClick(e, obj)} />
            </ArcherElement>
        );
    }

    if (isIconText(obj)) {
        return (
            <ArcherElement key={obj.id} id={obj.id}>
                <IconText obj={obj} isSelected={isSelected} onClick={(e) => handleClick(e, obj)} />
            </ArcherElement>
        );
    }

    if (isTitledContainer(obj)) {
        return (
            <ArcherElement key={obj.id} id={obj.id} relations={relations(obj.links)}>
                <TitledContainerNode obj={obj} isSelected={isSelected} onClick={(e) => handleClick(e, obj)} />
            </ArcherElement>
        );
    }

    if (isCenteredContainer(obj)) {
        return (
            <ArcherElement key={obj.id} id={obj.id} relations={relations(obj.links)}>
                <CenteredContainerNode obj={obj} isSelected={isSelected} onClick={(e) => handleClick(e, obj)} />
            </ArcherElement>
        );
    }

    if (isImage(obj)) {
        return (
            <ArcherElement key={obj.id} id={obj.id}>
                <ImageNode obj={obj} isSelected={isSelected} onClick={(e) => handleClick(e, obj)} />
            </ArcherElement>
        );
    }

    if (isVideo(obj)) {
        return (
            <ArcherElement key={obj.id} id={obj.id}>
                <VideoNode obj={obj} isSelected={isSelected} onClick={(e) => handleClick(e, obj)} />
            </ArcherElement>
        );
    }

    return <div key={obj.id}>Unknown Node Type</div>;
};
