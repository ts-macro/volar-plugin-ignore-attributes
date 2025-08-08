import { createPlugin } from 'ts-macro'
import { getRules } from './rule'

interface Options {
  include?: string[]
  exclude?: string[]
  prefix?: string
}

function isMatched(rule: string | RegExp, name: string) {
  return typeof rule === 'string'
    ? rule === name
    : rule.test(name)
}

const plugin = createPlugin<Options | undefined>((
  { ts, vueCompilerOptions },
  options = vueCompilerOptions?.ignoreAttributes ?? {},
) => {
  const cache = new Map<string, boolean>()
  const rules = getRules(options.prefix)
  rules.push(...options.include || [])
  const exclude = [/^v-.*/, ...options.exclude || []]

  return {
    name: 'ignore-attributes',
    enforce: 'post',
    resolveVirtualCode({ ast, codes, lang }) {
      if (!['jsx', 'tsx'].includes(lang))
        return

      function walk(
        node: import('typescript').Node,
      ) {
        const properties = ts.isJsxElement(node)
          ? node.openingElement.attributes.properties
          : ts.isJsxSelfClosingElement(node)
            ? node.attributes.properties
            : []
        for (const attribute of properties) {
          if (
            ts.isJsxAttribute(attribute)
            && (!attribute.initializer
              || ts.isStringLiteral(attribute.initializer))
          ) {
            const attributeName = getText(attribute.name, ast, ts)
            if (exclude.some(rule => isMatched(rule, attributeName)))
              continue

            const hasCached = cache.has(attributeName)
            const result = hasCached
              ? cache.get(attributeName)!
              : rules.some(rule => isMatched(rule, attributeName))
            if (!hasCached)
              cache.set(attributeName, result)

            if (result) {
              const nameText = getText(attribute.name, ast, ts)
              if (nameText.includes('-')) {
                continue
              }
              const start = getStart(attribute, ast, ts)
              codes.replaceRange(
                start,
                attribute.name.end + (attribute.initializer ? 1 : 0),
                'ignore-',
                nameText,
                attribute.initializer ? '=' : '',
              )
            }
          }
        }

        ts.forEachChild(node, walk)
      }
      ts.forEachChild(ast, walk)
    },
  }
})

export default plugin

function getStart(
  node:
    | import('typescript').Node
    | import('typescript').NodeArray<import('typescript').Node>,
  ast: import('typescript').SourceFile,
  ts: typeof import('typescript'),
): number {
  return (ts as any).getTokenPosOfNode(node, ast)
}

function getText(
  node: import('typescript').Node,
  ast: import('typescript').SourceFile,
  ts: typeof import('typescript'),
): string {
  return ast!.text.slice(getStart(node, ast, ts), node.end)
}
