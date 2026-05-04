/**
 * Mirror of {@code com.nuraimed.conspect.node.base.params.Icon}
 * (conspect-service: {@code src/main/java/com/nuraimed/conspect/node/base/params/Icon.java}).
 *
 * API JSON stores the emoji string (Jackson {@code @JsonValue} on {@code Icon#value}).
 * When editing the Java enum, update this object to stay in sync.
 */
export const CONSPECT_ICONS = {
  PEDESTRIAN: '🚶',
  PEDESTRIAN_W: '🚶‍♀️',
  FIRE: '🔥',
  SPEAK: '🗣️',
  HAMMER: '🔨',
  USERS: '👥',
  SNOW: '❄️',
  HAMMER_AND_WRENCH: '🛠️',
  TREE: '🌳',
  ROCK: '🪨',
  CAVE: '🏕️',
  BOW_AND_ARROW: '🏹',
  BOAT: '🛶',
  WHEAT: '🌾',
  HOUSES: '🏘️',
  COW: '🐄',
  LEAF: '🌿',
  PRAY: '🙏',
  MAP: '🗺️',
  HANDSHAKE: '🤝',
  MAHJONG: '🀄',
  SWORDS: '⚔️',
  CROWN: '👑',
  FLEUR: '⚜️',
  HORSE: '🐎',
  CLOCK: '🕛',
  OLD_CLOCK: '🕰️',
  FAMILY: '👨‍👩‍👧‍👦',
  CASTLE: '🏰',
  SHIELD: '🛡️',
  SCROLL: '📜',
  CAR: '🚗',
  PICTURE: '🏞️',
  WOMAN: '👩',
  CALENDAR: '📅',
  MAN_TEACHER: '👨‍🏫',
  HERB: '🌿',
  HOUSE_WITH_GARDEN: '🏡',
  RAM: '🐏',
  MOUNTAIN: '⛰️',
  BRIEF_CASE: '💼',
  CITY_PICTURE: '🏙️',
  GLOBE: '🌍',
  RED_TRIANGLE_POINTED_DOWN: '🔻',
  SUNRISE_OVER_MOUNTAINS: '🌄',
  CRESCENT_MOON: '🌙',
  BOOKS: '📚',
  SUN: '🔆',
  BUILDING: '🏗️',
  WIND: '🌬️',
  HAT: '🎩',
  BALANCE_SCALE: '⚖️',
  ROUND_PUSHPIN: '📍',
  WORLD_MAP: '🗺️',
  POPPER: '🎉',
  MOSQUE: '🕌',
  TIME: '⏳',
  WAVE: '🌊',
  SUN_WITH_FACE: '🌞',
  CLASSICAL_BUILDING: '🏛️️',
  GLOWING_STAR: '🌟',
  NUMBER_ONE: '➊',
  NUMBER_TWO: '➋',
  NUMBER_THREE: '➌',
} as const

export type ConspectIconKey = keyof typeof CONSPECT_ICONS

export type ConspectIconGlyph = (typeof CONSPECT_ICONS)[ConspectIconKey]

export const CONSPECT_ICON_LIST: ReadonlyArray<{
  key: ConspectIconKey
  glyph: ConspectIconGlyph
}> = (Object.keys(CONSPECT_ICONS) as ConspectIconKey[]).map((key) => ({
  key,
  glyph: CONSPECT_ICONS[key],
}))

const GLYPH_TO_KEYS = new Map<string, ConspectIconKey[]>()
for (const { key, glyph } of CONSPECT_ICON_LIST) {
  const arr = GLYPH_TO_KEYS.get(glyph) ?? []
  arr.push(key)
  GLYPH_TO_KEYS.set(glyph, arr)
}

/** First backend key for a glyph (for labels when several keys share one emoji). */
export function primaryKeyForGlyph(glyph: string): ConspectIconKey | undefined {
  return GLYPH_TO_KEYS.get(glyph)?.[0]
}

export function isConspectIconGlyph(s: string): s is ConspectIconGlyph {
  return GLYPH_TO_KEYS.has(s)
}
