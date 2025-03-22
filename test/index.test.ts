import { describe, expect, it } from 'vitest'
import { getRules } from '../src/rule'

describe('should', () => {
  const rules = getRules()
  it('exported', () => {
    const attrs = ['flex', 'sm:op30', 'm1', 'mb', 'b', 'mx5', 'gap3', 'i']
    for (const attr of attrs) {
      const res = rules.some(rule => typeof rule === 'string'
        ? rule === attr
        : rule.test(attr))
      expect(res).toEqual(true)
    }
  })
})
