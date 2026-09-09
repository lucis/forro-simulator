# Forró Simulator

A React + TypeScript frontend built with Vite, deployed as
[Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/).
The project has no backend and does not use Cloudflare Pages.

## V0 milestone: Home Studio

The `/` route is the main mobile-first experience. Its landing fold explains
the pitch — struggling to dance forró on the beat? Learn with the Forró
Simulator — and points at the two steps: pick a style and a track, then hit
**Simular** and tune the controls.

Once you simulate, the app loads the track's timeline, synchronizes the audio
with a pedagogical beat count, and renders two geometric dancers in Three.js.
The stage offers front, side, and top camera presets, lets you hide either
dancer, and lets you switch the couple's step pattern (e.g. "Frente e trás",
"Dois pra lá, dois pra cá") without touching playback.

The audio is the single source of truth for timing: play, pause, seek, and
playback rate all keep the beat count and the dancers' movement locked to the
track's timeline.

## Tools Annotator

The `/tools/annotator` route accepts a local MP3 and its metadata without
uploading the file to any server. Editor shortcuts:

- `Space`: play or pause;
- `Z`: mark a beat on the top of the zabumba;
- `C`: mark the camarão (bottom stroke);
- `A`: start an `accordion-only` section;
- `R`: start a `rhythm` section;
- `Delete` or `Backspace`: remove the selected marker.

After marking two `Z · Z · Z · C` cycles, use **Prever até o fim** (predict to
the end). Drag a prediction and use **Reflow a partir daqui** to recompute the
following beats. The timeline and the matching catalog entry can both be
exported as JSON.

### Adding a track to the catalog

1. Open `/tools/annotator`, pick the MP3, and fill in ID, title, artist, and rhythm.
2. Mark the track, or import a compatible timeline.
3. Export the timeline and the catalog entry.
4. Copy the MP3 to `public/tracks/<id>/audio.mp3`.
5. Copy the timeline to `public/tracks/<id>/timeline.json`.
6. Append the generated entry to the `public/catalog.json` array.

In V0 these files are added to the repository by hand. The catalog layer can
later be swapped for a real API without rewriting the home page.

## Requirements

- Node.js 20.19 or newer
- npm 10 or newer
- a Cloudflare account for deployment

## Development

```bash
npm install
npm run dev
```

Vite prints the local address and reloads the page on code changes.

## Checks

```bash
npm test -- --run
npm run typecheck
npm run lint
npm run build
```

The production build is written to `dist/`.

## Local preview

```bash
npm run build
npm run preview
```

## Cloudflare Workers

`wrangler.jsonc` ships `dist/` through Workers Static Assets.
`not_found_handling: "single-page-application"` serves `index.html` for
navigations that don't match a file, so `/tools/annotator` can be opened
directly.

Validate the bundle without publishing:

```bash
npm run deploy:dry-run
```

Before the first deploy, authenticate Wrangler:

```bash
npx wrangler login
```

Then publish:

```bash
npm run deploy
```

The deploy script always runs a fresh build before publishing.
