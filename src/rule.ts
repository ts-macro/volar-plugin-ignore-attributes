const twoStringsCompositionPrefix = [
  'm',
  'p',
]

const twoStringsCompositionSuffix = [
  'r',
  'b',
  'l',
  't',
  'a',
]

const twoStringsComposition = [
  ...twoStringsCompositionPrefix.flatMap(
    prefix => twoStringsCompositionSuffix.map(suffix => `${prefix}${suffix}\\d*(px)?`),
  ),
  'ha',
  'wa',
]

const specialSingleWord = [
  'container',
  'flex',
  'block',
  'inline',
  'table',
  'isolate',
  'absolute',
  'relative',
  'fixed',
  'sticky',
  'static',
  'visible',
  'invisible',
  'grow',
  'shrink',
  'antialiased',
  'italic',
  'ordinal',
  'overline',
  'underline',
  'uppercase',
  'lowercase',
  'capitalize',
  'truncate',
  'border',
  'rounded',
  'outline',
  'ring',
  'shadow',
  'blur',
  'grayscale',
  'invert',
  'sepia',
  'transition',
  'resize',
  'transform',
  'filter',
]

const pseudoPrefix = [
  'active',
  'before',
  'after',
  'dark',
  'light',
  'first',
  'last',
  'focus',
  'hover',
  'link',
  'root',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  'enabled',
  'disabled',
  'all',
  'children',
]

const separateEnabled = [
  'align',
  'animate',
  'backdrop',
  'bg',
  'blend',
  'border',
  'box',
  'bottom',
  'container',
  'content',
  'cursor',
  'display',
  'divide',
  'filter',
  'flex',
  'font',
  'fw',
  'gap',
  'gradient',
  'grid',
  'h',
  'items',
  'justify',
  'list',
  'left',
  'm',
  'nuxt',
  'opacity',
  'order',
  'outline',
  'overflow',
  'p',
  'place',
  'pos',
  'ring',
  'right',
  'select',
  'shadow',
  'space',
  'table',
  'text',
  'transform',
  'transition',
  'top',
  'underline',
  'w',
  'z',
  ...pseudoPrefix,
]

const stringNumberAttributes = `(${[
  'op',
  'opacity',
  'fw',
  'p',
  'm',
  'w',
  'h',
  'z',
].join('|')})\\d*(px)?`

const pseudoPrefixAttributes = pseudoPrefix.join('|')

const basicAttributes = [
  ...specialSingleWord,
  ...twoStringsComposition,
  ...separateEnabled,
].join('|')

export function getRules(prefix = '') {
  return [
    new RegExp(`^${prefix}((${pseudoPrefixAttributes}):)?((${basicAttributes})|(${stringNumberAttributes}))$`),
  ]
}
