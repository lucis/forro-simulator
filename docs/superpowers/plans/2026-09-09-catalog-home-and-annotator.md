# Catalog, Home Studio, and Annotator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the application into a mobile-first public Home Studio backed by a static track catalog and a production-accessible annotator that accepts local MP3 files.

**Architecture:** Route `/` renders a catalog-driven player whose track selection stays in React state; `/tools/annotator` renders an isolated authoring workflow. Catalog and timeline resources are fetched through pure parsing/loading boundaries so a future API can replace static files without changing page components.

**Tech Stack:** Vite 8, React 19, TypeScript 6, WaveSurfer.js 7, Vitest, React Testing Library, Cloudflare Workers Static Assets

**Spec:** `docs/superpowers/specs/2026-09-09-home-studio-and-annotator-design.md`

## Global Constraints

- Keep the application frontend-only and compatible with the existing Cloudflare Worker SPA fallback.
- Treat narrow mobile layout as the reference implementation; desktop is progressive enhancement.
- Keep track metadata in `public/catalog.json` and timeline events in separate per-track JSON files.
- Do not upload or persist locally selected audio; use a browser object URL and revoke it when replaced.
- Keep the annotator reachable at `/tools/annotator` but absent from public Home Studio navigation.
- Preserve the user-created timeline at `src/assets/se-tu-quiser-timeline.json` until it has been copied into the static catalog and verified byte-for-byte.

---

### Task 1: Static catalog model and parser

**Files:**
- Create: `src/catalog/catalog.ts`
- Create: `src/catalog/catalog.test.ts`
- Create: `public/catalog.json`
- Create: `public/tracks/se-tu-quiser/timeline.json`
- Create: `public/tracks/se-tu-quiser/audio.mp3`

**Interfaces:**
- Produces: `TrackCatalogEntry`, `TrackCatalog`, `parseTrackCatalog(value: unknown): TrackCatalog`
- Consumes: no application interfaces

- [ ] **Step 1: Write failing catalog parser tests**

```ts
import { describe, expect, test } from 'vitest'
import { parseTrackCatalog } from './catalog'

const valid = {
  tracks: [{
    id: 'se-tu-quiser',
    title: 'Se Tu Quiser',
    artist: 'Santana, O Cantador',
    rhythmId: 'xote',
    audioUrl: '/tracks/se-tu-quiser/audio.mp3',
    timelineUrl: '/tracks/se-tu-quiser/timeline.json',
  }],
}

describe('parseTrackCatalog', () => {
  test('aceita e preserva uma entrada válida', () => {
    expect(parseTrackCatalog(valid)).toEqual(valid)
  })

  test.each([
    {},
    { tracks: [{}] },
    { tracks: [{ ...valid.tracks[0], id: '' }] },
    { tracks: [{ ...valid.tracks[0], audioUrl: 'https://example.com/a.mp3' }] },
  ])('rejeita catálogo inválido: %o', (value) => {
    expect(() => parseTrackCatalog(value)).toThrow('Catálogo inválido')
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- --run src/catalog/catalog.test.ts`

Expected: FAIL because `src/catalog/catalog.ts` does not exist.

- [ ] **Step 3: Implement the minimal catalog types and parser**

```ts
export type TrackCatalogEntry = {
  id: string
  title: string
  artist: string
  rhythmId: string
  audioUrl: string
  timelineUrl: string
  coverUrl?: string
}

export type TrackCatalog = { tracks: TrackCatalogEntry[] }

const isLocalPath = (value: unknown): value is string =>
  typeof value === 'string' && value.startsWith('/')

export function parseTrackCatalog(value: unknown): TrackCatalog {
  if (!value || typeof value !== 'object' || !('tracks' in value) || !Array.isArray(value.tracks)) {
    throw new Error('Catálogo inválido')
  }
  const valid = value.tracks.every((track) => {
    if (!track || typeof track !== 'object') return false
    const item = track as Record<string, unknown>
    return typeof item.id === 'string' && item.id.length > 0 &&
      typeof item.title === 'string' && item.title.length > 0 &&
      typeof item.artist === 'string' && item.artist.length > 0 &&
      typeof item.rhythmId === 'string' && item.rhythmId.length > 0 &&
      isLocalPath(item.audioUrl) && isLocalPath(item.timelineUrl) &&
      (item.coverUrl === undefined || isLocalPath(item.coverUrl))
  })
  if (!valid) throw new Error('Catálogo inválido')
  return value as TrackCatalog
}
```

- [ ] **Step 4: Add the current track to static storage**

Create `public/catalog.json` with the valid fixture above. Copy the user timeline to `public/tracks/se-tu-quiser/timeline.json` and the MP3 to `public/tracks/se-tu-quiser/audio.mp3`. Keep the source files while the current application still imports them, and verify the copies byte-for-byte:

```bash
cmp 'src/assets/se-tu-quiser-timeline.json' 'public/tracks/se-tu-quiser/timeline.json'
cmp 'src/assets/Santana, O Cantador - Se Tu Quiser.mp3' 'public/tracks/se-tu-quiser/audio.mp3'
```

- [ ] **Step 5: Run focused and static-data checks**

Run: `npm test -- --run src/catalog/catalog.test.ts && jq empty public/catalog.json public/tracks/se-tu-quiser/timeline.json`

Expected: parser tests PASS and both JSON files parse successfully.

- [ ] **Step 6: Commit**

```bash
git add src/catalog public
git commit -m "feat: add static track catalog"
```

---

### Task 2: Catalog repository and selected-track loader

**Files:**
- Create: `src/catalog/catalogRepository.ts`
- Create: `src/catalog/catalogRepository.test.ts`
- Modify: `src/audio/timelineQueries.ts`

**Interfaces:**
- Consumes: `parseTrackCatalog`, `parseTrackTimeline`, `TrackCatalogEntry`
- Produces: `loadCatalog(fetcher?: typeof fetch): Promise<TrackCatalog>`, `loadCatalogTrack(entry, fetcher?): Promise<TrackTimeline>`

- [ ] **Step 1: Write failing loader tests**

```ts
import { expect, test, vi } from 'vitest'
import { loadCatalog, loadCatalogTrack } from './catalogRepository'

test('carrega o catálogo estático', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ tracks: [] }) })
  await expect(loadCatalog(fetcher as typeof fetch)).resolves.toEqual({ tracks: [] })
  expect(fetcher).toHaveBeenCalledWith('/catalog.json')
})

test('rejeita timeline pertencente a outra faixa', async () => {
  const entry = { id: 'a', title: 'A', artist: 'B', rhythmId: 'xote', audioUrl: '/a.mp3', timelineUrl: '/a.json' }
  const fetcher = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ trackId: 'outra', rhythmId: 'xote', events: [] }),
  })
  await expect(loadCatalogTrack(entry, fetcher as typeof fetch)).rejects.toThrow('Timeline incompatível')
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- --run src/catalog/catalogRepository.test.ts`

Expected: FAIL because the repository module does not exist.

- [ ] **Step 3: Implement fetch, status, parsing, and identity checks**

```ts
export async function loadCatalog(fetcher = fetch) {
  const response = await fetcher('/catalog.json')
  if (!response.ok) throw new Error('Não foi possível carregar o catálogo')
  return parseTrackCatalog(await response.json())
}

export async function loadCatalogTrack(entry: TrackCatalogEntry, fetcher = fetch) {
  const response = await fetcher(entry.timelineUrl)
  if (!response.ok) throw new Error('Não foi possível carregar a timeline')
  const timeline = parseTrackTimeline(await response.json())
  if (timeline.trackId !== entry.id || timeline.rhythmId !== entry.rhythmId) {
    throw new Error('Timeline incompatível com a faixa')
  }
  return timeline
}
```

- [ ] **Step 4: Add HTTP-failure and malformed-JSON cases, then run tests**

Run: `npm test -- --run src/catalog/catalogRepository.test.ts src/audio/timelineQueries.test.ts`

Expected: all focused tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/catalog src/audio/timelineQueries.ts
git commit -m "feat: add catalog resource repository"
```

---

### Task 3: Make the audio player source-driven

**Files:**
- Modify: `src/audio/AudioPlayer.tsx`
- Create: `src/audio/AudioPlayer.test.tsx`
- Delete after all consumers use `src`: `src/assets/Santana, O Cantador - Se Tu Quiser.mp3`

**Interfaces:**
- Consumes: a browser-loadable audio URL
- Produces: `AudioPlayerProps` extended with `src: string` and optional `compact?: boolean`

- [ ] **Step 1: Write a failing source-change test**

Mock `wavesurfer.js`, render `<AudioPlayer src="/one.mp3" ... />`, rerender with `src="/two.mp3"`, and assert that the old instance is destroyed and `WaveSurfer.create` receives `url: '/two.mp3'`.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- --run src/audio/AudioPlayer.test.tsx`

Expected: FAIL because `AudioPlayer` has no `src` prop and still imports the bundled MP3.

- [ ] **Step 3: Replace the hard-coded import with the prop**

```ts
type AudioPlayerProps = {
  src: string
  compact?: boolean
  currentTime: number
  onCurrentTimeChange(time: number): void
  onDurationChange(duration: number): void
  onViewportChange(viewport: TimelineViewport): void
}
```

Use `url: src` in `WaveSurfer.create`, include `src` in the creation effect dependencies, and reset time/duration/viewport before the new instance reports ready. Preserve Space, playback speed, seek, and zoom behavior.

After every render site passes an explicit source, remove the old bundled MP3. Its byte-identical copy under `public/tracks/se-tu-quiser/audio.mp3` is now the catalog source.

- [ ] **Step 4: Run audio and existing application tests**

Run: `npm test -- --run src/audio/AudioPlayer.test.tsx src/App.test.tsx`

Expected: PASS after updating existing render sites with an explicit source.

- [ ] **Step 5: Commit**

```bash
git add src/audio/AudioPlayer.tsx src/audio/AudioPlayer.test.tsx src/App.test.tsx 'src/assets/Santana, O Cantador - Se Tu Quiser.mp3'
git commit -m "refactor: make audio player source driven"
```

---

### Task 4: Route shell and mobile-first Home Studio

**Files:**
- Create: `src/app/AppRouter.tsx`
- Create: `src/app/AppRouter.test.tsx`
- Create: `src/pages/HomeStudioPage.tsx`
- Create: `src/pages/HomeStudioPage.test.tsx`
- Create: `src/components/RhythmFilter.tsx`
- Create: `src/components/TrackPicker.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`
- Delete after repository migration: `src/data/xoteTimeline.json`
- Delete after repository migration: `src/assets/se-tu-quiser-timeline.json`

**Interfaces:**
- Consumes: `loadCatalog`, `loadCatalogTrack`, `AudioPlayer`
- Produces: route selection for `/` and `/tools/annotator`; Home Studio selection state and a stable `HomeStageSlot` boundary for the dance plan

- [ ] **Step 1: Write failing route and Home Studio tests**

Test that `/` renders heading `Escolha o ritmo`, the first track is selected after mocked catalog resolution, `Xote` filters the track list, selecting a second track changes the visible title and audio source, and `/tools/annotator` renders the annotator heading. Test an unknown path renders a `Página não encontrada` message with a link to `/`.

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm test -- --run src/app/AppRouter.test.tsx src/pages/HomeStudioPage.test.tsx`

Expected: FAIL because the route shell and page do not exist.

- [ ] **Step 3: Implement dependency-light route selection**

```ts
export function routeFor(pathname: string) {
  if (pathname === '/') return 'home' as const
  if (pathname === '/tools/annotator' || pathname === '/tools/annotator/') return 'annotator' as const
  return 'not-found' as const
}
```

`AppRouter` reads `window.location.pathname` once because the V0 has no in-app route navigation. Do not add React Router for two static entry routes.

- [ ] **Step 4: Implement Home Studio state and loading flow**

Load the catalog on mount. Select the first track, fetch its timeline, and keep `selectedTrackId`, `currentTime`, `duration`, and resource status in the page. Use rhythm chips derived from unique `rhythmId` values and horizontally scrolling track buttons. Render a stage placeholder with `aria-label="Palco de dança"`; the second plan replaces its contents.

Once `App` no longer imports the bundled empty timeline, remove `src/data/xoteTimeline.json`. Once the Home Studio has loaded and parsed `public/tracks/se-tu-quiser/timeline.json` in a test, remove the byte-identical staging file `src/assets/se-tu-quiser-timeline.json`.

- [ ] **Step 5: Add explicit loading and failure states**

Catalog failure renders `Não foi possível carregar o catálogo` plus a retry button. Timeline failure renders the selected track as unavailable without removing other track controls. Switching tracks pauses/remounts the player through a `key={selectedTrack.id}` and resets time to zero.

- [ ] **Step 6: Implement mobile-first CSS**

At `320px` width, use one vertical column, scrollable chips/cards with touch-sized controls of at least `44px`, no horizontal page overflow, and a stage with a stable `min-height`. Add wider-grid enhancements only in `min-width` media queries.

- [ ] **Step 7: Run the focused tests**

Run: `npm test -- --run src/app/AppRouter.test.tsx src/pages/HomeStudioPage.test.tsx src/App.test.tsx`

Expected: all route, catalog-selection, and legacy behavior tests PASS after legacy expectations move to the annotator page.

- [ ] **Step 8: Commit**

```bash
git add src/app src/pages/HomeStudioPage.tsx src/pages/HomeStudioPage.test.tsx src/components src/App.tsx src/App.test.tsx src/index.css src/data/xoteTimeline.json src/assets/se-tu-quiser-timeline.json
git commit -m "feat: add mobile-first catalog home studio"
```

---

### Task 5: Generic local-file annotator

**Files:**
- Create: `src/pages/AnnotatorPage.tsx`
- Create: `src/pages/AnnotatorPage.test.tsx`
- Create: `src/editor/TrackDraftForm.tsx`
- Create: `src/editor/catalogExport.ts`
- Create: `src/editor/catalogExport.test.ts`
- Modify: `src/editor/TimelineEditor.tsx`
- Modify: `src/audio/AudioPlayer.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: local `File`, supported `Rhythm`, existing `TimelineEditor`
- Produces: `CatalogDraftMetadata`, `createCatalogEntry(metadata): TrackCatalogEntry`, generic annotation page, timeline JSON export

- [ ] **Step 1: Write failing authoring tests**

Cover these exact cases: the page initially asks for an MP3; choosing `forro.mp3` calls `URL.createObjectURL`; replacing it revokes the old URL; metadata fields create a draft timeline with matching IDs; importing a mismatched timeline leaves the draft unchanged and shows `Timeline incompatível`; export produces both the exact sorted `TrackTimeline` and a catalog snippet using `/tracks/<track-id>/audio.mp3` and `/tracks/<track-id>/timeline.json`.

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm test -- --run src/pages/AnnotatorPage.test.tsx src/editor/catalogExport.test.ts`

Expected: FAIL because generic authoring modules do not exist.

- [ ] **Step 3: Implement metadata normalization and catalog export**

```ts
export type CatalogDraftMetadata = {
  trackId: string
  title: string
  artist: string
  rhythmId: string
}

export function createCatalogEntry(metadata: CatalogDraftMetadata): TrackCatalogEntry {
  const root = `/tracks/${metadata.trackId}`
  return {
    id: metadata.trackId,
    title: metadata.title.trim(),
    artist: metadata.artist.trim(),
    rhythmId: metadata.rhythmId,
    audioUrl: `${root}/audio.mp3`,
    timelineUrl: `${root}/timeline.json`,
  }
}
```

Accept only lowercase slugs matching `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`. Disable the editor/export until required metadata and an `audio/*` file are present.

- [ ] **Step 4: Implement the local object-URL lifecycle**

Store `{ file, url }` together. Revoke the previous URL before replacing it and revoke the active URL on page unmount. Do not store the file or URL in localStorage.

- [ ] **Step 5: Adapt TimelineEditor to a supplied track/rhythm**

Remove assumptions that the page title and source audio are fixed. Preserve current keyboard marking and timeline behavior. Limit rhythm selection to `XOTE_RHYTHM` in this release, but make the form options originate from a `SUPPORTED_RHYTHMS` array rather than hard-coded JSX.

- [ ] **Step 6: Run authoring and regression tests**

Run: `npm test -- --run src/pages/AnnotatorPage.test.tsx src/editor src/audio`

Expected: all annotator, marker, prediction, query, and player tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/pages/AnnotatorPage.tsx src/pages/AnnotatorPage.test.tsx src/editor src/audio/AudioPlayer.tsx src/index.css
git commit -m "feat: make annotator accept local tracks"
```

---

### Task 6: Catalog/annotator integration verification

**Files:**
- Modify: `README.md`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: all prior tasks
- Produces: documented local catalog-authoring workflow and verified first increment

- [ ] **Step 1: Add an end-to-end component test**

Mock `fetch` for `/catalog.json` and the selected timeline, render the real app at `/`, select the track, and assert the audio player receives `/tracks/se-tu-quiser/audio.mp3`. Render at `/tools/annotator`, select an MP3, and assert the editor appears without a network upload.

- [ ] **Step 2: Document adding a track locally**

Add commands and exact destinations to README: open `/tools/annotator`, select a local MP3, annotate/import, export, copy the MP3 to `public/tracks/<id>/audio.mp3`, copy timeline to `timeline.json`, and append the emitted catalog entry to `public/catalog.json`.

- [ ] **Step 3: Run the complete verification gate**

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
npm run build
npm run deploy:dry-run
npm audit
git diff --check
```

Expected: zero failing tests, zero type/lint/build errors, Wrangler dry-run success, zero audit vulnerabilities, and no whitespace errors.

- [ ] **Step 4: Verify mobile and direct-route behavior in Chrome**

At `390x844`, confirm no horizontal document overflow, rhythm chips and tracks scroll horizontally, controls are touchable, and track switching resets time. Open `/tools/annotator` directly, select a local MP3, create one marker, and export JSON. Repeat the Home Studio smoke test at `1440x1000`.

- [ ] **Step 5: Commit**

```bash
git add README.md src/App.test.tsx
git commit -m "docs: describe static catalog authoring workflow"
```
