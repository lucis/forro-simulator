export type TimelineViewport = {
  start: number
  end: number
}

export function timeToViewportPercent(
  time: number,
  viewport: TimelineViewport,
) {
  const duration = viewport.end - viewport.start
  if (duration <= 0) return 0
  return ((time - viewport.start) / duration) * 100
}

export function viewportRatioToTime(
  ratio: number,
  viewport: TimelineViewport,
) {
  const clampedRatio = Math.min(1, Math.max(0, ratio))
  return viewport.start + clampedRatio * (viewport.end - viewport.start)
}
