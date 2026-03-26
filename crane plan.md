# Crane Enhancement Plan

## 1. More Wing Flapping During Flight

**Problem**: Crane looks like it's gliding — wings barely move during scroll-driven flight.

**Solution**: Increase `baseFlutter` amplitude and frequency, and tie flap intensity more aggressively to scroll velocity. Currently `velocityBoost` is capped at `0.12` — raise to `0.3+`. Also add a secondary harmonic so the flap looks organic rather than a single sine wave.

**Files**: `src/scripts/scene.js` — `animateWings()` function + velocity flutter calc in render loop.

**Changes**:
- `baseFlutter`: raise from `sin(t*2.5)*0.04` → `sin(t*3.5)*0.08` (faster, larger)
- Add secondary harmonic: `+ sin(t*7)*0.02` for realistic asymmetry
- `velocityFlutter` cap: raise from `0.12` → `0.30`
- Multiplier: `craneSpeed * 8` → `craneSpeed * 20` so flight speed drives flapping more strongly

---

## 2. Fix "Long Way Round" Turning

**Problem**: When the crane reverses direction (e.g., flying right → flying left), the yaw rotation takes the long way around (sweeps through 180° instead of the shortest arc). Looks like it does a U-turn at 2 o'clock before settling at 10 o'clock.

**Root Cause**: `currentYaw += (targetYaw - currentYaw) * rotLerp` doesn't handle the angle wrapping around ±π. When going from +π/2 (right) to -π/2 (left), the difference is -π (long way), but the shortest path is only π across 0.

**Solution**: Normalize the yaw delta to `[-π, π]` before lerping:
```js
let yawDelta = targetYaw - currentYaw;
// Wrap to shortest path
while (yawDelta > Math.PI) yawDelta -= Math.PI * 2;
while (yawDelta < -Math.PI) yawDelta += Math.PI * 2;
currentYaw += yawDelta * rotLerp;
```

**Files**: `src/scripts/scene.js` — rotation section in render loop (~line 345-350).

---

## 3. Add Roll into Turns

**Problem**: Crane turns flat, like a weathervane. Real birds bank/roll into turns.

**Current State**: `targetBank = -craneVelX * 1.5` exists but the value is tiny because `craneVelX` is ~0.001. The effect is imperceptible.

**Solution**: Scale the bank angle based on the *rate of yaw change* (angular velocity), not just lateral velocity. When the crane is actively turning (yaw changing), bank into the turn:
```js
const yawRate = targetYaw - currentYaw; // how fast yaw is changing
targetBank = -yawRate * 2.0;           // bank proportional to turn rate
```
Also increase the bank lerp speed slightly so it responds faster than yaw, which is realistic (birds roll into a turn before the heading changes).

**Files**: `src/scripts/scene.js` — bank calculation section.

---

## 4. Add Body/Torso Thickness

**Problem**: The crane body is paper-thin — just a flat plane connecting the wings. Looks like a kite, not a bird.

**Solution**: Add a 3D diamond/wedge body by giving the torso vertices a Y offset (top and bottom surfaces). Currently body vertices are all at `y=0` or `y=-0.02`. Add:
- An upper body ridge: center body vertices raised to `y=0.06`
- A lower body keel: center vertices lowered to `y=-0.06`
- This creates a diamond cross-section giving the illusion of a 3D torso

**Vertex changes in `buildCrane()`**:
- Add new triangles for the upper body (above the current flat plane)
- Add new triangles for the lower body (below)
- Keep wing attachment points at existing positions
- Total: ~6 new triangles (18 vertices) for upper and lower torso surfaces

**Files**: `src/scripts/scene.js` — `buildCrane()` function, vertices array.

---

## 5. Dark Mode Night Bird

**Problem**: The white/silver paper crane looks out of place against the dark night sky.

**Solution**: In dark mode, change the crane's material color to a darker palette resembling a hawk or owl:
- Body color: `0xB8CAD8` → dark mode `0x2A3848` (dark slate-blue)
- Edge color: `0x8A9AAC` → dark mode `0x4A6070` (muted teal-gray)
- Subtle warm emissive glow: `0x1A1008` at intensity `0.08` (owl-like warm undertone)
- Optionally adjust the wing proportions slightly wider (owls have broader wings) via a scale transform

**Implementation**: In the theme adaptation section of the render loop, lerp the material colors based on `isDarkMode()`.

**Files**: `src/scripts/scene.js` — theme adaptation section + crane material references.

---

## 6. Landing Animation at Page Bottom

**Problem**: Crane just floats at the bottom of the page. Would be more immersive if it "lands."

**Solution**: When `scrollProgress > 0.92`, transition the crane into a landing pose:
1. **Approach**: Crane descends smoothly toward the footer bar position
2. **Flare**: Wings spread wide (increase wing vertex Y) and body pitches up (landing flare)
3. **Touch**: Crane settles onto the footer bar, wings fold down, slight bounce
4. **Ripple**: A circular ripple effect emanates from the landing point — CSS or Three.js ring geometry that scales up and fades out

**Ripple implementation options**:
- **CSS approach**: A `<div>` positioned at the footer, triggered via class toggle, using `transform: scale()` + `opacity` animation
- **Three.js approach**: A `RingGeometry` mesh at the landing Y-position, animated to scale up from 0 to 2 while fading from 0.4 to 0 opacity. More integrated with the 3D scene.

**Landing state machine**:
```
FLYING → APPROACHING (scroll > 0.92) → FLARING (scroll > 0.96) → LANDED (scroll > 0.99)
```

**Files**: `src/scripts/scene.js` — new landing state logic in render loop, new ripple mesh creation, waypoint adjustment for final scroll positions.

---

## 7. Tail Feather Flutter

**Problem**: The tail is completely static — it's a rigid triangular wedge that never moves. Real birds' tail feathers flex and fan during flight, especially during turns and speed changes.

**Solution**: Animate the tail tip vertex (the one at `z=-0.55`) with a subtle lateral sway and vertical flutter, tied to both time and crane speed:
```js
// Tail tip vertex (index ~33-35 area, the 0,0.04,-0.55 vertex)
const tailFlutter = Math.sin(time * 3) * 0.015 + Math.sin(time * 5.5) * 0.008;
const tailSway = Math.sin(time * 1.8) * 0.02 * (1 + craneSpeed * 30);
// Apply to tail tip Y and X
```
The tail should also fan slightly wider during turns (spread the two side tail vertices apart when yaw is changing quickly).

**Files**: `src/scripts/scene.js` — `animateWings()` function (extend to animate tail vertices too).

---

## 8. Head Nod During Flight

**Problem**: The crane's head/neck is rigid — it looks taxidermied. Real cranes bob their heads subtly during flight, especially when changing altitude.

**Solution**: Add a gentle vertical oscillation to the head/beak vertex (at `0, 0.12, 0.56`) and neck tip (at `0, 0.16, 0.42`). The bob should be:
- Frequency: roughly 2x the wing flap frequency (head bobs on each downstroke)
- Amplitude: very subtle (~0.01-0.02 Y offset)
- Extra nod when descending (`craneVelY < 0`)

```js
const headBob = Math.sin(time * 5) * 0.012 + (craneVelY < 0 ? craneVelY * 3 : 0);
// Apply to neck tip and beak vertices
```

**Files**: `src/scripts/scene.js` — `animateWings()` function (extend to animate head vertices too).

---

## Implementation Order (suggested)

1. **Fix turning direction** (#2) — quickest fix, biggest visual improvement
2. **Add roll** (#3) — pairs with #2, both are rotation fixes
3. **More wing flapping** (#1) — straightforward amplitude change
4. **Tail flutter** (#7) — pairs with #1, both vertex animations
5. **Head nod** (#8) — pairs with #7, completes the life-like motion set
6. **Body thickness** (#4) — geometry change, moderate effort
7. **Dark mode night bird** (#5) — material swap, moderate effort
8. **Landing animation** (#6) — most complex, save for last
