# Timeline-Driven Dance Stage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile-first geometric dance stage whose count and xote movement stay synchronized with the selected track timeline.

**Architecture:** Pure TypeScript converts audio time into dance-clock state and interpolated couple poses. React owns selected-track/audio state, while React Three Fiber only renders the computed pose; it never advances a separate musical clock.

**Tech Stack:** React 19, TypeScript 6, Three.js, React Three Fiber, React Three Drei, Vitest, React Testing Library

**Spec:** `docs/superpowers/specs/2026-09-09-home-studio-and-annotator-design.md`

## Global Constraints

- Begin only after `docs/superpowers/plans/2026-09-09-catalog-home-and-annotator.md` is complete.
- The first rhythm marker activates dance; a `rhythm` section marker is not required.
- `accordion-only`, `break`, and `outro` suppress dance until a later `rhythm` section.
- Do not extrapolate movement after the final rhythm marker.
- Keep timing and pose logic independent from React and Three.js.
- Treat `390x844` as the primary manual viewport.
- Do not implement step queues, loop persistence, realistic models, inverse kinematics, or advanced choreography.

---

### Task 1: Pure timeline dance clock

**Files:**
- Create: `src/dance/danceClock.ts`
- Create: `src/dance/danceClock.test.ts`

**Interfaces:**
- Consumes: `Rhythm`, `RhythmMarker`, `TrackTimeline`, `getSectionAtTime`
- Produces: `DanceClockState`, `getDanceClockState({ time, timeline, rhythm }): DanceClockState`

- [ ] **Step 1: Write failing clock tests**

Use a four-marker `z1/z2/z3/camarao` fixture at `1/2/3/4` seconds plus a following `z1` at `5`. Assert: time before `1` is inactive; `1.5` has `slotId: 'z1'`, `slotProgress: 0.5`, `cycleProgress: 0.125`, and label `1`; an `accordion-only` section suppresses state; a later `rhythm` section resumes it; time at or after the final marker is inactive.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- --run src/dance/danceClock.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the state contract**

```ts
export type DanceClockState = {
  active: boolean
  currentMarker: RhythmMarker | null
  nextMarker: RhythmMarker | null
  slotId: string | null
  slotProgress: number
  cycleIndex: number
  cycleProgress: number
  danceLabel: string | null
  section: SectionKind | null
}
```

Sort rhythm markers by time/ID, find the adjacent marker interval containing `time`, and clamp progress to `[0, 1]`. Derive `cycleIndex` from the current marker's ordinal distance from the first marker and `cycleProgress` from `(slotIndex + slotProgress) / rhythm.cycle.length`. Return the inactive shape when no complete interval exists or an explicit non-rhythm section is active.

- [ ] **Step 4: Run clock and timeline-query tests**

Run: `npm test -- --run src/dance/danceClock.test.ts src/audio/timelineQueries.test.ts`

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/dance/danceClock.ts src/dance/danceClock.test.ts
git commit -m "feat: add timeline-driven dance clock"
```

---

### Task 2: Dance pose domain and basic xote pattern

**Files:**
- Create: `src/domain/dance.ts`
- Create: `src/dance/patterns/basicXote.ts`
- Create: `src/dance/patterns/basicXote.test.ts`

**Interfaces:**
- Produces: `Vec2`, `Weight`, `DancerPose`, `CouplePose`, `DanceKeyframe`, `DancePattern`, `BASIC_XOTE`
- Consumes: no rendering interfaces

- [ ] **Step 1: Write failing pattern invariants**

Assert that `BASIC_XOTE.durationInCycles === 2`, keyframes begin at `0`, end at `1`, are strictly ordered, leader/follower positions mirror on the forward axis, and the final pose equals the initial pose so the loop has no jump.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- --run src/dance/patterns/basicXote.test.ts`

Expected: FAIL because the types and pattern do not exist.

- [ ] **Step 3: Create the domain types**

```ts
export type Vec2 = { x: number; z: number }
export type Weight = 'left' | 'right' | 'center'
export type DancerPose = {
  leftFoot: Vec2
  rightFoot: Vec2
  weight: Weight
  rotation: number
  bodyOffset: Vec2
}
export type CouplePose = { leader: DancerPose; follower: DancerPose }
export type DanceKeyframe = { cycleProgress: number; pose: CouplePose }
export type DancePattern = {
  id: string
  name: string
  durationInCycles: number
  keyframes: DanceKeyframe[]
}
```

- [ ] **Step 4: Define a two-cycle, nine-keyframe basic pattern**

Use keyframes at `0, .125, .25, .375, .5, .625, .75, .875, 1`. The first cycle moves leader forward/follower backward through three weight transfers plus pause; the second reverses the travel. Use small meter-like units (`0.18` lateral, `0.22` longitudinal) and return exactly to the neutral starting pose at `1`.

- [ ] **Step 5: Run the invariant test**

Run: `npm test -- --run src/dance/patterns/basicXote.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain/dance.ts src/dance/patterns
git commit -m "feat: define basic xote dance pattern"
```

---

### Task 3: Pure pose interpolation

**Files:**
- Create: `src/dance/interpolateDance.ts`
- Create: `src/dance/interpolateDance.test.ts`

**Interfaces:**
- Consumes: `DancePattern`, `CouplePose`
- Produces: `interpolatePattern(pattern: DancePattern, progress: number): CouplePose`

- [ ] **Step 1: Write failing interpolation tests**

Create a two-keyframe fixture and assert exact start, midpoint linear interpolation for foot/body/rotation, discrete weight from the preceding keyframe, exact end wrapping to start, negative progress wrapping, and `1.25` matching `.25`.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- --run src/dance/interpolateDance.test.ts`

Expected: FAIL because the function does not exist.

- [ ] **Step 3: Implement normalized lookup and field interpolation**

Normalize with `((progress % 1) + 1) % 1`, find surrounding keyframes, and linearly interpolate every numeric field with one shared `lerp`. Keep `weight` from the earlier keyframe until the later keyframe is reached. Throw `Padrão de dança sem keyframes` for an empty pattern.

- [ ] **Step 4: Run interpolation and pattern tests**

Run: `npm test -- --run src/dance/interpolateDance.test.ts src/dance/patterns/basicXote.test.ts`

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/dance/interpolateDance.ts src/dance/interpolateDance.test.ts
git commit -m "feat: interpolate dance pattern poses"
```

---

### Task 4: Geometric React Three Fiber stage

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/dance/Dancer.tsx`
- Create: `src/dance/DanceScene.tsx`
- Create: `src/dance/DanceStage.tsx`
- Create: `src/dance/DanceStage.test.tsx`

**Interfaces:**
- Consumes: `CouplePose`, active state, camera preset, visibility flags
- Produces: `DanceStageProps`, geometric leader/follower rendering

- [ ] **Step 1: Install rendering dependencies**

Run: `npm install three @react-three/fiber @react-three/drei`

Expected: package manifests contain compatible resolved versions with no peer-dependency errors.

- [ ] **Step 2: Write a failing stage-boundary test**

Mock `@react-three/fiber`'s `Canvas` as a plain element and `DanceScene` as a prop recorder. Assert that `DanceStage` exposes `aria-label="Palco de dança"`, forwards the supplied couple pose, and honors `showLeader`/`showFollower`.

- [ ] **Step 3: Run the test and verify RED**

Run: `npm test -- --run src/dance/DanceStage.test.tsx`

Expected: FAIL because the stage does not exist.

- [ ] **Step 4: Implement the geometric dancer**

Build each dancer from primitive meshes grouped under one root: feet as boxes, legs/body/head as simple boxes/capsule/sphere geometry. Apply pose foot coordinates to feet, body offset to the root, and rotation to the group. Use contrasting leader/follower palettes and no external model files.

- [ ] **Step 5: Implement scene and stage**

Add ambient/directional lights, a matte floor, orthographic or perspective camera suitable for the complete couple, and Drei orbit controls with zoom disabled on mobile by default. `DanceStage` owns Canvas configuration but receives all musical/pose state from React props.

- [ ] **Step 6: Run stage tests and typecheck**

Run: `npm test -- --run src/dance/DanceStage.test.tsx && npm run typecheck`

Expected: PASS with no WebGL required in jsdom.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/dance
git commit -m "feat: add geometric 3d dance stage"
```

---

### Task 5: Connect selected track, clock, count, and controls

**Files:**
- Create: `src/components/DanceCount.tsx`
- Create: `src/components/DanceControls.tsx`
- Create: `src/components/DanceCount.test.tsx`
- Modify: `src/pages/HomeStudioPage.tsx`
- Modify: `src/pages/HomeStudioPage.test.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `getDanceClockState`, `BASIC_XOTE`, `interpolatePattern`, `DanceStage`
- Produces: synchronized Home Studio stage, count UI, camera/visibility local controls

- [ ] **Step 1: Write failing integration tests**

Mock `DanceStage`. With audio time between `z1` and `z2`, assert visible count `1` and a pose derived from the same clock state. Assert a seek to the next interval changes count to `2`; before the first marker count reads `Prepare-se`; after the last it reads `Fim`; toggling leader/follower changes the stage props; changing camera preset changes the stage prop without touching audio state.

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm test -- --run src/components/DanceCount.test.tsx src/pages/HomeStudioPage.test.tsx`

Expected: FAIL because the clock is not connected to the Home Studio.

- [ ] **Step 3: Compute one shared frame state**

```ts
const clock = getDanceClockState({ time: currentTime, timeline, rhythm })
const patternProgress = ((clock.cycleIndex + clock.cycleProgress) / BASIC_XOTE.durationInCycles) % 1
const pose = clock.active
  ? interpolatePattern(BASIC_XOTE, patternProgress)
  : BASIC_XOTE.keyframes[0].pose
```

Resolve `rhythmId` through a `RHYTHMS_BY_ID` record. Unknown rhythm IDs render a clear unavailable-stage message rather than defaulting silently to xote.

- [ ] **Step 4: Implement count and controls**

`DanceCount` displays the active `danceLabel`; inactive states distinguish `Prepare-se`, explicit paused section, and `Fim`. `DanceControls` provides three camera presets (`frente`, `lateral`, `superior`) and independent leader/follower checkboxes with 44px touch targets.

- [ ] **Step 5: Run focused and full component tests**

Run: `npm test -- --run src/components src/pages/HomeStudioPage.test.tsx src/dance`

Expected: all focused tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components src/pages/HomeStudioPage.tsx src/pages/HomeStudioPage.test.tsx src/index.css src/domain/rhythm.ts
git commit -m "feat: synchronize dancers with track timeline"
```

---

### Task 6: Mobile-first visual polish and release verification

**Files:**
- Modify: `src/index.css`
- Modify: `README.md`

**Interfaces:**
- Consumes: complete Home Studio and stage
- Produces: verified mobile-first V0 dance experience

- [ ] **Step 1: Add CSS invariants to component tests**

Assert semantic regions and control labels rather than implementation classes: catalog, selected track, dance stage, count, player, camera options, and dancer visibility are all discoverable by accessible name.

- [ ] **Step 2: Finish narrow-screen layout**

At `390x844`, keep the selected track and stage above secondary controls, make the stage use most of the usable width with a stable aspect ratio, overlay count without covering dancers, keep horizontal catalog rails contained, and prevent document-level horizontal scrolling. Respect `prefers-reduced-motion` for non-musical UI transitions; dancer movement remains user-controlled by audio playback.

- [ ] **Step 3: Add desktop enhancement**

At `min-width: 900px`, expand the maximum content width and place secondary controls beside or below the stage without changing DOM order.

- [ ] **Step 4: Run the complete automated gate**

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

Expected: zero failures, successful Worker dry-run, zero audit vulnerabilities, and no whitespace errors.

- [ ] **Step 5: Perform browser verification**

At `390x844`, select Se Tu Quiser, play, pause, seek, change speed, switch all three camera presets, and hide/show each dancer. Confirm count and pose change on the same timeline markers and the page has no horizontal overflow. At `1440x1000`, confirm the enhanced layout. Navigate directly to `/tools/annotator` and ensure it remains functional after Three.js installation.

- [ ] **Step 6: Commit**

```bash
git add src/index.css README.md
git commit -m "feat: polish mobile dance studio"
```

