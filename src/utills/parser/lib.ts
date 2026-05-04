import {
    AlignItems,
    AlignSelf,
    Background,
    BaseNode,
    BorderType,
    FlexWrap,
    FontColor,
    FontSize,
    FontWeight,
    JustifyContent,
    TextAlign
} from "./types";
import React from "react";


const PRIMARY_BACKGROUND = "#5348F2"
const SECONDARY_BACKGROUND = "#353254"
const TERTIARY_BACKGROUND = "#282828"
const DEFAULT_BACKGROUND = "#282828"


const FONT_PRIMARY_COLOR = "#5348F2"
const FONT_DEFAULT_COLOR = "#fff"
const FONT_SECONDARY_COLOR = "#91898C"
const FONT_TERTIARY_COLOR = "rgba(145,137,140,0.5)"

const TEXT_SIZE_BIG = '2rem'
const TEXT_SIZE_MEDIUM = '1.5rem'
const TEXT_SIZE_SMALL = '1rem'

const FONT_WEIGHT_BOLD = '900'
const FONT_WEIGHT_REGULAR = '600'
const FONT_WEIGHT_THIN = '100'

export const getStylesFromBaseNode = (obj: BaseNode) => {
    const style: React.CSSProperties = {
        ...(obj.width && {width: obj.width}),
        ...(obj.height && {height: obj.height}),
        ...(obj.background && obj.background !== Background.NONE && {background: getBackground(obj.background)}),
        ...(obj.padding && {padding: obj.padding}),
        ...(obj.margin && {margin: obj.margin}),
        ...(obj.opacity !== null && {opacity: obj.opacity}),
        ...(obj.borderRadius !== null && {borderRadius: obj.borderRadius}),
        ...(obj.borderType && {border: getBorder(obj.borderType, obj.borderColor, "2px")}),
        ...(obj.overflowX && {overflowX: obj.overflowX == 'scroll' ? 'scroll' : 'auto'}),
        ...(obj.overflowY && {overflowY: obj.overflowY == 'scroll' ? 'scroll' : 'auto'}),
        ...(obj.flex && {flex: obj.flex}),
        ...(obj.minWidth && {minWidth: obj.minWidth}),
        ...(obj.minHeight && {minHeight: obj.minHeight}),
        ...(obj.alignSelf && obj.alignSelf !== AlignSelf.AUTO && {alignSelf: getAlignSelf(obj.alignSelf)}),
    };

    return style;
};


export const getFontWeight = (fontWeight: FontWeight) => {
    switch (fontWeight) {
        case FontWeight.BOLD:
            return FONT_WEIGHT_BOLD;
        case FontWeight.REGULAR:
            return FONT_WEIGHT_REGULAR;
        case FontWeight.THIN:
            return FONT_WEIGHT_THIN;
        default:
            return FONT_WEIGHT_REGULAR
    }
}

export const getFontSize = (fontSize: FontSize) => {
    switch (fontSize) {
        case FontSize.BIG:
            return TEXT_SIZE_BIG;
        case FontSize.MEDIUM:
            return TEXT_SIZE_MEDIUM;
        case FontSize.SMALL:
            return TEXT_SIZE_SMALL;
    }
}

export const getBackground = (backgroundType: Background | undefined) => {
    switch (backgroundType) {
        case Background.NONE:
            return 'transparent'
        case Background.PRIMARY:
            return PRIMARY_BACKGROUND
        case Background.DEFAULT:
            return DEFAULT_BACKGROUND
        case Background.SECONDARY:
            return SECONDARY_BACKGROUND
        case Background.TERTIARY:
            return TERTIARY_BACKGROUND
    }

    return 'transparent'
}

export const getTextAlign = (textAlign: TextAlign | undefined) => {
    switch (textAlign) {
        case TextAlign.CENTER:
            return 'center'
        case TextAlign.LEFT:
            return 'left'
        case TextAlign.RIGHT:
            return 'right'
    }
    return 'left'
}

export const getColor = (color?: FontColor) => {
    switch (color) {
        case FontColor.DEFAULT:
            return FONT_DEFAULT_COLOR
        case FontColor.SECONDARY:
            return FONT_SECONDARY_COLOR
        case FontColor.TERTIARY:
            return FONT_TERTIARY_COLOR
        case FontColor.PRIMARY:
            return FONT_PRIMARY_COLOR;
    }
}

export const getFlexWrap = (wrap: FlexWrap) => {
    switch (wrap) {
        case FlexWrap.WRAP:
            return 'wrap'
        case FlexWrap.NOWRAP:
            return 'nowrap'
    }
}

export const getBorder = (borderType: BorderType | undefined, color: FontColor | undefined, width: string = "1px") => {
    if (!borderType || borderType === BorderType.NONE) {
        return "none";
    }
    return `${width} ${borderType} ${getColor(color)}`;
};

export const getJustifyContent = (justifyContent: JustifyContent) => {
    switch (justifyContent) {
        case JustifyContent.SPACE_BETWEEN:
            return 'space-between';
        case JustifyContent.CENTER:
            return 'center';
        case JustifyContent.SPACE_AROUND:
            return 'space-around';
        case JustifyContent.STRETCH:
            return 'stretch';
    }
};

export const getAlignItemsValue = (value: AlignItems) => {
    switch (value) {
        case AlignItems.CENTER:
            return 'center';
        case AlignItems.END:
            return 'end';
        case AlignItems.START:
            return 'start';
        case AlignItems.STRETCH:
            return 'stretch';
    }
};

export const getAlignSelf = (value: AlignSelf): React.CSSProperties['alignSelf'] => {
    switch (value) {
        case AlignSelf.AUTO:
            return 'auto';
        case AlignSelf.CENTER:
            return 'center';
        case AlignSelf.END:
            return 'flex-end';
        case AlignSelf.START:
            return 'flex-start';
        case AlignSelf.STRETCH:
            return 'stretch';
        case AlignSelf.BASELINE:
            return 'baseline';
    }
    return 'auto';
};

