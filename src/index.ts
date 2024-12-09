import { replaceSourceRange } from 'muggle-string'
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

function toRegex(rule: string | RegExp) {
  let _rule = rule
  if (typeof _rule === 'string') {
    _rule = new RegExp(_rule)
  }
  return _rule
}

const plugin = createPlugin<Options | undefined>((
  { ts, vueCompilerOptions },
  options = vueCompilerOptions?.ignoreAttributes ?? {},
) => {
  const cache = new Map<string, boolean>()
  const rules = getRules(options.prefix)
  rules.push(...options.include?.map(toRegex) || [])
  const exclude = [/^v-.*/, ...options.exclude?.map(toRegex) || []]

  return {
    name: 'ignore-attributes',
    enforce: 'post',
    resolveVirtualCode({ ast, codes, source, languageId }) {
      if (!['jsx', 'tsx'].includes(languageId))
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
              : rules.some((rule) => {
                const result = isMatched(rule, attributeName)
                return result
              })
            if (!hasCached)
              cache.set(attributeName, result)

            if (result) {
              replaceSourceRange(
                codes,
                source,
                getStart(attribute, ast, ts),
                attribute.end,
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
