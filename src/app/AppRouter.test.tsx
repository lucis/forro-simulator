import { expect, test } from 'vitest'
import { routeFor } from './route'

test.each([
  ['/', 'home'],
  ['/tools/annotator', 'annotator'],
  ['/tools/annotator/', 'annotator'],
  ['/desconhecida', 'not-found'],
])('resolve %s como %s', (path, expected) => {
  expect(routeFor(path)).toBe(expected)
})
