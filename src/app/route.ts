export function routeFor(pathname: string) {
  if (pathname === '/') return 'home' as const
  if (pathname === '/tools/annotator' || pathname === '/tools/annotator/') return 'annotator' as const
  return 'not-found' as const
}
