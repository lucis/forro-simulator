# Forró Simulator — Home Studio and Catalog Authoring Design

## Objective

Turn the current rhythm annotation proof of concept into two distinct experiences:

- a mobile-first public Home Studio where a person chooses a rhythm and track, plays the music, and watches geometric dancers synchronized to its annotated timeline; and
- a directly accessible authoring tool that uses a local MP3 to create or revise the timeline JSON needed to add a track to the static catalog.

The first release continues to be frontend-only and deploys as one Cloudflare Worker with static assets. A future database-backed submission flow is outside this increment, but the catalog boundary must allow that source to replace static files later.

## Routes and Product Boundaries

### `/`

The public Home Studio is the primary product. It contains the catalog selector, stage, dance count, audio transport, and later the step-loop controls in one page. Track selection is local React state; selecting a track does not navigate or reload the page.

### `/tools/annotator`

The annotation tool remains available in production by direct URL. The public home does not link to it. It is an authoring utility, not part of the listener/dancer flow.

The Worker retains SPA fallback behavior so both routes work on direct navigation.

## Mobile-First Home Studio

The narrow-screen layout is the reference implementation and follows this vertical hierarchy:

1. compact product header;
2. horizontally scrollable rhythm filters;
3. horizontally scrollable track selector;
4. prominent 3D dance stage;
5. pedagogical count overlaid on or immediately attached to the stage;
6. audio transport and timeline progress;
7. an extension area for future step-loop controls.

The first catalog track is selected initially. Changing tracks replaces the audio, timeline, rhythm definition, and dance-clock input atomically. The stage is inactive while those resources are loading or invalid.

Desktop layouts may redistribute these regions into a wider grid, but must retain the same information hierarchy and state model. Desktop is an enhancement, not a separate application layout.

## Catalog Model and Static Storage

Static catalog data is served from `public/`:

```text
public/
  catalog.json
  tracks/
    se-tu-quiser/
      audio.mp3
      timeline.json
      cover.webp       # optional
```

Each catalog entry contains a stable track ID, title, artist, rhythm ID, and URLs for audio, timeline, and optional artwork. Timeline data remains separate from display metadata.

Application code consumes catalog data through a small repository interface rather than importing a particular JSON file in UI components. The initial repository fetches static JSON. A future API/database implementation can satisfy the same interface.

Runtime parsing validates catalog entries and timelines before exposing them to the UI. Invalid tracks produce a visible per-track error and do not crash the rest of the catalog.

## Annotation Workflow

The annotator starts without a hard-coded song. The author:

1. selects an MP3 from the local device;
2. enters a stable track ID, title, and artist;
3. chooses a supported rhythm;
4. optionally imports an existing timeline JSON;
5. marks, predicts, drags, and corrects rhythm events;
6. exports the timeline JSON and a catalog-entry snippet.

The browser creates an object URL for the selected MP3. Uploading does not transmit or persist the audio. The tool revokes replaced object URLs.

The author then manually adds the MP3 and exported timeline under `public/tracks/<track-id>/` and adds the generated metadata entry to `public/catalog.json`. Direct filesystem writing from the browser is not part of the V0.

An imported timeline must match the selected track and rhythm IDs. Exported timeline events are sorted and preserve stable event IDs and sources.

## Timeline-Driven Dance Clock

The dance clock is pure TypeScript with no React or Three.js dependency. It derives the active rhythm slot, slot progress, cycle progress, pedagogical label, and section from audio time plus a validated track timeline.

A rhythm-section marker is not required. The first rhythm marker activates the dance clock. Explicit non-rhythm sections such as `break` or `outro` can suppress dancing, and a later `rhythm` section resumes it.

Before the first rhythm marker, the dancers hold their neutral pose. After the final marker, they stop rather than extrapolating beyond annotated data.

## Dance Rendering

The initial stage uses Three.js through React Three Fiber. It renders two simple geometric dancers and a basic xote pattern. Domain pose calculation and interpolation remain independent from Three.js; the renderer only translates computed poses into scene transforms.

The basic pattern loops from the dance clock and mirrors leader/follower movement. The pedagogical count is timeline-derived rather than animation-frame-derived, so seeking, pausing, and playback-rate changes keep all visible state synchronized.

Camera selection and independent dancer visibility are included after the basic synchronized scene works. Advanced choreography and user-defined step loops remain explicitly deferred.

## State and Data Flow

The Home Studio owns the selected track and current audio time:

```text
static catalog repository
  -> selected track resources
  -> audio currentTime
  -> pure dance clock
  -> pure pose interpolation
  -> count UI + Three.js stage
```

Only the audio player advances time. Neither Three.js nor the count UI maintains a competing clock. Seeking and track changes flow through the same state path.

The annotator owns a separate draft timeline. No authoring state leaks into the Home Studio.

## Failure and Loading Behavior

- Catalog loading shows a compact loading state.
- A catalog-level fetch or schema failure shows a retryable error instead of an empty stage.
- A broken track resource marks that track unavailable while leaving other tracks usable.
- A locally selected unsupported audio file produces an inline annotator error.
- Invalid imported timelines are rejected without replacing the current draft.
- Track changes stop the previous audio and reset its playhead before activating the next track.

## Verification

Pure unit tests cover catalog parsing, timeline parsing, dance-clock boundaries, section behavior, pattern interpolation, and looping.

React tests cover route selection, initial track selection, rhythm filtering, track switching, annotator upload state, import rejection, and export generation. Three.js internals are not snapshot-tested; integration tests verify that calculated pose/count inputs reach the stage boundary.

Manual browser verification covers the narrow mobile viewport first, then desktop enhancement, direct navigation to `/tools/annotator`, audio seeking, playback-rate synchronization, and track switching.

The completion gate remains: tests, TypeScript, ESLint, production build, Cloudflare Worker dry-run, and a clean Git diff check.

## Deferred Scope

- database-backed catalog or submissions;
- authentication and moderation;
- uploading files to a server;
- user-authored step queues or loop persistence;
- multiple dance patterns per rhythm;
- realistic character models, inverse kinematics, or advanced choreography;
- automatic beat detection.
