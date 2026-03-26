/**
 * Three.js scene — Procedural origami paper crane
 * Immersive sky environment with soft clouds, wind, and interactive particles
 * Crane flies through the site following a smooth S-curve path
 */

import * as THREE from 'three';

export function initScene() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  if (window.innerWidth < 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── RENDERER ────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: window.devicePixelRatio < 2,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;

  // ── SCENE + FOG ───────────────────────────────────────
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xBCC8DB, 0.04);

  // ── CAMERA ──────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  // ── LIGHTING ─────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0xD4E8F5, 0.6);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xFFF8F0, 0.9);
  key.position.set(3, 4, 5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xA8D8E8, 0.3);
  fill.position.set(-3, -1, 2);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xFFFFFF, 0.15);
  rim.position.set(-2, 2, -3);
  scene.add(rim);

  const cursorLight = new THREE.PointLight(0x4A9FBC, 0.3, 8);
  cursorLight.position.set(0, 0, 3);
  scene.add(cursorLight);

  // ── ORIGAMI CRANE ─────────────────────────────────────
  const crane = buildCrane();
  crane.position.set(1.8, 0.5, 0);
  crane.scale.setScalar(2.2);
  crane.rotation.set(0, Math.PI * 0.5, 0); // facing right initially
  scene.add(crane);

  // ── SOFT CLOUD TEXTURE (canvas-generated) ─────────────
  // Use a slightly gray-blue tint so clouds are visible against the light sky
  const cloudTexture = (() => {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(180,200,220,1.0)');
    g.addColorStop(0.2, 'rgba(190,210,228,0.8)');
    g.addColorStop(0.5, 'rgba(200,218,235,0.35)');
    g.addColorStop(0.75, 'rgba(210,225,240,0.1)');
    g.addColorStop(1, 'rgba(220,232,245,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();

  // ── PARALLAX CLOUD LAYERS (soft sprites, not rectangles) ─
  const cloudLayers = [
    { group: new THREE.Group(), count: 10, zRange: [-1, 0.5], scrollSpeed: 0.3,  opRange: [0.30, 0.50], sizeRange: [1.2, 2.5] },
    { group: new THREE.Group(), count: 14, zRange: [-3, -1],  scrollSpeed: 0.15, opRange: [0.18, 0.30], sizeRange: [0.8, 1.5] },
    { group: new THREE.Group(), count: 12, zRange: [-5, -3],  scrollSpeed: 0.05, opRange: [0.10, 0.18], sizeRange: [0.5, 1.0] },
  ];

  cloudLayers.forEach(layer => {
    scene.add(layer.group);
    for (let i = 0; i < layer.count; i++) {
      const size = layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]);
      const baseOpacity = layer.opRange[0] + Math.random() * (layer.opRange[1] - layer.opRange[0]);
      const mat = new THREE.SpriteMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: baseOpacity,
        depthWrite: false,
        fog: false, // clouds should not be affected by scene fog
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(size, size * 0.5, 1);
      sprite.position.set(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        layer.zRange[0] + Math.random() * (layer.zRange[1] - layer.zRange[0])
      );
      sprite.userData.speed = 0.0006 + Math.random() * 0.0012;
      sprite.userData.drift = Math.random() * Math.PI * 2;
      sprite.userData.baseOpacity = baseOpacity;
      layer.group.add(sprite);
    }
  });

  // ── STARS (dark mode only — twinkling night sky) ─────────
  const starCount = 200;
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 20;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    starPositions[i * 3 + 2] = -3 + Math.random() * -5;
    starSizes[i] = 0.5 + Math.random() * 2.0;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

  const starMaterial = new THREE.PointsMaterial({
    color: 0xDDE8F4,
    size: 0.04,
    transparent: true,
    opacity: 0,
    sizeAttenuation: true,
    depthWrite: false,
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // ── WIND STREAMS (curved Bezier lines) ─────────────────
  const windGroup = new THREE.Group();
  scene.add(windGroup);

  for (let i = 0; i < 8; i++) {
    const startY = (Math.random() - 0.5) * 8;
    const startZ = -1 + Math.random() * -3;
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-6 + Math.random() * -2, startY, startZ),
      new THREE.Vector3(-2 + Math.random() * 2, startY + (Math.random() - 0.5) * 2, startZ + Math.random() * -1),
      new THREE.Vector3(2 + Math.random() * 2, startY + (Math.random() - 0.5) * 2, startZ + Math.random() * -1),
      new THREE.Vector3(6 + Math.random() * 2, startY + (Math.random() - 0.5) * 3, startZ),
    );
    const points = curve.getPoints(20);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x9AB0C8,
      transparent: true,
      opacity: 0.08,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    line.userData.speed = 0.0008 + Math.random() * 0.0015;
    line.userData.phaseOffset = Math.random() * Math.PI * 2;
    windGroup.add(line);
  }

  // ── SCROLL WAYPOINTS (smooth S-curve, position only) ────
  // Crane starts large in hero, then shrinks and sweeps wider across the page
  const waypoints = [
    { scroll: 0.00, px:  1.8, py: 0.5,  pz: 0.0,  scale: 2.2 },
    { scroll: 0.06, px:  1.4, py: 0.9,  pz: 0.2,  scale: 2.0 },
    { scroll: 0.14, px:  0.0, py: 1.2,  pz: 0.3,  scale: 1.6 },
    { scroll: 0.24, px: -2.5, py: 0.6,  pz: 0.1,  scale: 1.3 },
    { scroll: 0.36, px: -1.0, py:-0.2,  pz: 0.0,  scale: 1.2 },
    { scroll: 0.48, px:  2.8, py: 0.3,  pz: 0.2,  scale: 1.2 },
    { scroll: 0.60, px:  1.5, py: 1.0,  pz: 0.1,  scale: 1.3 },
    { scroll: 0.72, px: -2.2, py: 0.5,  pz: 0.3,  scale: 1.2 },
    { scroll: 0.84, px: -0.5, py:-0.3,  pz: 0.2,  scale: 1.3 },
    { scroll: 0.94, px:  2.0, py: 0.4,  pz: 0.4,  scale: 1.2 },
    { scroll: 1.00, px:  0.5, py: 0.0,  pz: 0.3,  scale: 1.3 },
  ];

  // ── MOUSE TRACKING ──────────────────────────────────
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // ── SCROLL STATE ────────────────────────────────────
  let scrollProgress = 0;
  let scrollVelocity = 0;
  let lastScrollTop = 0;

  function updateScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    scrollVelocity = Math.abs(scrollTop - lastScrollTop);
    lastScrollTop = scrollTop;
  }

  // ── RESIZE ──────────────────────────────────────────
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  // ── THEME AWARENESS ─────────────────────────────────
  function isDarkMode() {
    return document.documentElement.dataset.theme === 'dark';
  }

  // ── INTERPOLATION ───────────────────────────────────
  function lerp(a, b, t) { return a + (b - a) * t; }

  function getWaypointValues(progress) {
    progress = Math.max(0, Math.min(1, progress));
    let lo = waypoints[0], hi = waypoints[waypoints.length - 1];

    for (let i = 0; i < waypoints.length - 1; i++) {
      if (progress >= waypoints[i].scroll && progress <= waypoints[i + 1].scroll) {
        lo = waypoints[i];
        hi = waypoints[i + 1];
        break;
      }
    }

    const range = hi.scroll - lo.scroll;
    const t = range > 0 ? (progress - lo.scroll) / range : 0;
    const st = t * t * (3 - 2 * t); // smoothstep

    return {
      px: lerp(lo.px, hi.px, st),
      py: lerp(lo.py, hi.py, st),
      pz: lerp(lo.pz, hi.pz, st),
      scale: lerp(lo.scale, hi.scale, st),
    };
  }

  // ── CLICK ANIMATION STATE ──────────────────────────
  let isFolding = false;
  let foldTime = 0;

  const craneMesh = crane.children[0];
  const craneMaterial = craneMesh.material;
  const craneEdges = crane.children[1];
  const edgeMaterial = craneEdges.material;

  const glowColor = new THREE.Color(0x4A9FBC);
  const resetEmissive = new THREE.Color(0x000000);

  // ── VELOCITY-BASED ROTATION STATE ──────────────────
  const PI = Math.PI;
  let prevCraneX = 1.8;
  let prevCraneY = 0.5;
  let craneVelX = 0;
  let craneVelY = 0;
  // Crane model faces +Z. ry=PI/2 means facing +X (right), ry=-PI/2 means facing -X (left)
  let currentYaw = PI * 0.5;   // start facing right
  let currentPitch = 0;
  let currentBank = 0;
  let targetYaw = PI * 0.5;
  let targetPitch = 0;
  let targetBank = 0;

  // ── RENDER LOOP ─────────────────────────────────────
  let time = 0;
  let isTabVisible = true;

  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
  });

  let smoothCrane = { px: 1.8, py: 0.5, pz: 0, scale: 2.2 };

  function animate() {
    requestAnimationFrame(animate);
    if (!isTabVisible) return;

    time += 0.016;
    updateScroll();

    const dark = isDarkMode();

    // ── THEME ADAPTATION ────────────────────────────
    scene.fog.color.set(dark ? 0x162240 : 0xBCC8DB);
    ambient.color.set(dark ? 0x1A2942 : 0xD4E8F5);
    ambient.intensity = dark ? 0.35 : 0.6;

    // Stars: visible only in dark mode, with twinkling
    const targetStarOpacity = dark ? 0.6 : 0;
    starMaterial.opacity += (targetStarOpacity - starMaterial.opacity) * 0.05;
    // Twinkle individual stars by slightly moving them
    const starPos = starGeometry.attributes.position.array;
    if (dark) {
      for (let i = 0; i < starCount; i++) {
        starPos[i * 3 + 1] += Math.sin(time * (1.5 + i * 0.03)) * 0.0001;
      }
      starGeometry.attributes.position.needsUpdate = true;
    }

    // Crane color: dark slate-blue in dark mode (owl/hawk), warm paper in light
    const targetBodyColor = dark ? 0x2A3848 : 0xB8CAD8;
    const targetEdgeColor = dark ? 0x4A6070 : 0x8A9AAC;
    craneMaterial.color.lerp(new THREE.Color(targetBodyColor), 0.05);
    edgeMaterial.color.lerp(new THREE.Color(targetEdgeColor), 0.05);
    if (!isFolding) {
      const targetEmissive = dark ? 0x1A1008 : 0x000000;
      craneMaterial.emissive.lerp(new THREE.Color(targetEmissive), 0.05);
      craneMaterial.emissiveIntensity += ((dark ? 0.08 : 0) - craneMaterial.emissiveIntensity) * 0.05;
    }

    // Dynamic fog
    const baseFogDensity = dark ? 0.03 : 0.04;
    scene.fog.density = baseFogDensity + scrollProgress * 0.03;

    // Scroll-responsive sky tint + CSS cloud offset
    document.body.style.setProperty('--scroll-hue', scrollProgress.toFixed(3));
    document.body.style.setProperty('--scroll-offset', scrollProgress.toFixed(3));

    // ── MOUSE LERP ──────────────────────────────────
    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;

    // ── CAMERA (subtle drift + mouse parallax) ──────
    const driftX = Math.sin(time * 0.3) * 0.015;
    const driftY = Math.cos(time * 0.25) * 0.01;
    camera.position.x = mouseX * 0.15 + driftX;
    camera.position.y = mouseY * 0.1 + driftY;
    camera.lookAt(0, 0, 0);

    cursorLight.position.x = mouseX * 3;
    cursorLight.position.y = mouseY * 2;

    // ── CRANE FLIGHT PATH ───────────────────────────
    const target = getWaypointValues(scrollProgress);
    const lerpSpeed = 0.025; // slightly slower for smoother motion

    smoothCrane.px += (target.px - smoothCrane.px) * lerpSpeed;
    smoothCrane.py += (target.py - smoothCrane.py) * lerpSpeed;
    smoothCrane.pz += (target.pz - smoothCrane.pz) * lerpSpeed;
    smoothCrane.scale += (target.scale - smoothCrane.scale) * lerpSpeed;

    // ── VELOCITY TRACKING ───────────────────────────
    craneVelX = smoothCrane.px - prevCraneX;
    craneVelY = smoothCrane.py - prevCraneY;
    prevCraneX = smoothCrane.px;
    prevCraneY = smoothCrane.py;

    const craneSpeed = Math.sqrt(craneVelX * craneVelX + craneVelY * craneVelY);
    const speedThreshold = 0.0003;

    if (craneSpeed > speedThreshold) {
      // atan2(velX, small_constant) gives ~PI/2 when moving right, ~-PI/2 when left
      // This correctly flips the crane to face its direction of travel
      targetYaw = Math.atan2(craneVelX, 0.001);
      targetPitch = -craneVelY * 2.5;
    }

    // Smooth rotation (low factor = graceful, no snapping)
    const rotLerp = 0.025;
    // Normalize yaw delta to [-PI, PI] so the crane takes the shortest turn
    let yawDelta = targetYaw - currentYaw;
    while (yawDelta > PI) yawDelta -= PI * 2;
    while (yawDelta < -PI) yawDelta += PI * 2;
    currentYaw += yawDelta * rotLerp;
    currentPitch += (targetPitch - currentPitch) * rotLerp;
    // Bank proportional to turn rate (yaw angular velocity), not just lateral velocity
    const yawRate = yawDelta;
    targetBank = -yawRate * 0.6;
    const bankLerp = 0.04; // bank responds faster than yaw (realistic)
    currentBank += (targetBank - currentBank) * bankLerp;

    const bob = Math.sin(time * 1.57) * 0.04; // reduced bob amplitude
    const yawDrift = Math.sin(time * 0.785) * 0.03; // reduced yaw drift

    // Smooth idle blend (no sudden jump when scroll stops)
    const idleBlend = Math.max(0, 1 - scrollVelocity * 0.5);
    const idleX = Math.sin(time * 0.4) * 0.04 * idleBlend; // smaller amplitude
    const idleY = Math.sin(time * 0.6) * Math.cos(time * 0.3) * 0.03 * idleBlend;

    crane.position.set(
      smoothCrane.px + idleX,
      smoothCrane.py + bob + idleY,
      smoothCrane.pz
    );
    crane.rotation.set(
      currentPitch + mouseY * 0.04,
      currentYaw + yawDrift + mouseX * 0.06,
      currentBank + Math.sin(time * 2.09) * 0.01
    );
    crane.scale.setScalar(smoothCrane.scale);

    // Wing flutter — tied to actual crane speed
    const velocityFlutter = Math.min(craneSpeed * 20, 0.30);
    animateWings(crane, time, velocityFlutter, craneVelY);

    craneMaterial.opacity = 0.92;
    edgeMaterial.opacity = 0.6;

    // ── FOLD/UNFOLD + WING FLAP CLICK ANIMATION ─────
    if (isFolding) {
      foldTime += 0.016;
      const totalDuration = 0.8;
      const t = Math.min(foldTime / totalDuration, 1.0);

      // Smoothstep fold-unfold
      let foldAmount;
      if (t < 0.5) {
        const ft = t / 0.5;
        foldAmount = ft * ft * (3 - 2 * ft);
      } else {
        const ut = (t - 0.5) / 0.5;
        foldAmount = 1 - ut * ut * (3 - 2 * ut);
      }

      // Wings flap DOWN during fold (not just flatten)
      // Move wing tip vertices downward based on foldAmount
      const geo = craneMesh.geometry;
      const pos = geo.attributes.position.array;
      const orig = geo.userData.originalPositions;
      if (orig) {
        const flapDown = foldAmount * -0.50; // wings push down hard
        // Left wing tip (vertex 25) and inner (vertex 29)
        pos[25 * 3 + 1] = orig[25 * 3 + 1] + flapDown;
        pos[29 * 3 + 1] = orig[29 * 3 + 1] + flapDown * 0.8;
        // Right wing tip (vertex 32) and inner (vertex 34)
        pos[32 * 3 + 1] = orig[32 * 3 + 1] + flapDown;
        pos[34 * 3 + 1] = orig[34 * 3 + 1] + flapDown * 0.8;
        geo.attributes.position.needsUpdate = true;
        geo.computeVertexNormals();
      }

      // Gentle Z tilt
      crane.rotation.z = currentBank + foldAmount * 0.06;

      // Glow at peak — light parts glow in dark mode, dark parts in light mode
      edgeMaterial.opacity = 0.6 + foldAmount * 0.2;
      const clickGlow = dark ? new THREE.Color(0xE8D8C8) : glowColor;
      craneMaterial.emissive.copy(clickGlow);
      craneMaterial.emissiveIntensity = foldAmount * (dark ? 0.35 : 0.12);

      if (t >= 1.0) {
        isFolding = false;
        foldTime = 0;
        // Reset wing vertices to original
        if (geo.userData.originalPositions) {
          const orig = geo.userData.originalPositions;
          pos[25 * 3 + 1] = orig[25 * 3 + 1];
          pos[29 * 3 + 1] = orig[29 * 3 + 1];
          pos[32 * 3 + 1] = orig[32 * 3 + 1];
          pos[34 * 3 + 1] = orig[34 * 3 + 1];
          geo.attributes.position.needsUpdate = true;
          geo.computeVertexNormals();
        }
        edgeMaterial.opacity = 0.6;
        craneMaterial.emissive.copy(resetEmissive);
        craneMaterial.emissiveIntensity = 0;
      }
    }

    // ── PARALLAX CLOUD LAYERS ──────────────────────
    cloudLayers.forEach(layer => {
      // Clouds drift upward as you scroll (parallax depth)
      layer.group.position.y = scrollProgress * layer.scrollSpeed * 3;

      layer.group.children.forEach((cloud, i) => {
        // Slow horizontal drift
        cloud.position.x += cloud.userData.speed;
        cloud.position.y += Math.sin(time * 0.3 + cloud.userData.drift) * 0.00015;
        if (cloud.position.x > 9) cloud.position.x = -9;
        // Opacity pulse — dark mode has much subtler clouds (stars dominate)
        cloud.material.opacity = cloud.userData.baseOpacity * (1 + Math.sin(time * 0.2 + i) * 0.2) * (dark ? 0.25 : 1);
      });
    });

    // ── WIND STREAMS ──────────────────────────────
    windGroup.children.forEach((line) => {
      line.position.x += line.userData.speed;
      if (line.position.x > 8) line.position.x = -8;
      line.position.y += Math.sin(time * 0.7 + line.userData.phaseOffset) * 0.0003;
      line.material.opacity = 0.02 + Math.sin(time * 0.5 + line.userData.phaseOffset) * 0.015;
    });

    renderer.render(scene, camera);
  }

  animate();

  // ── CRANE CLICK ────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  document.addEventListener('click', (e) => {
    if (e.target.closest('a, button, .mission-card, .contact-link, .toolkit-tag, input, textarea')) return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(crane.children, true);
    if (intersects.length > 0 && !isFolding) {
      isFolding = true;
      foldTime = 0;
    }
  });
}

// ── BUILD ORIGAMI CRANE ────────────────────────────────
function buildCrane() {
  const group = new THREE.Group();

  const vertices = new Float32Array([
    // BODY — upper surface (diamond ridge at y=0.06)
    0, 0.06, 0.08,     -0.15, 0, -0.1,   0.15, 0, -0.1,      // front upper
    0, 0.06, 0.08,     0.15, 0, -0.1,    0, 0.04, -0.35,      // right upper
    0, 0.06, 0.08,     0, 0.04, -0.35,   -0.15, 0, -0.1,      // left upper
    -0.15, 0, -0.1,    0, 0.04, -0.35,   0.15, 0, -0.1,       // rear upper
    // BODY — lower surface (keel at y=-0.06)
    0, -0.06, 0.08,    0.15, 0, -0.1,    -0.15, 0, -0.1,      // front lower
    0, -0.06, 0.08,    0, -0.06, -0.35,  0.15, 0, -0.1,       // right lower
    0, -0.06, 0.08,    -0.15, 0, -0.1,   0, -0.06, -0.35,     // left lower
    -0.15, 0, -0.1,    0.15, 0, -0.1,    0, -0.06, -0.35,     // rear lower
    // LEFT WING
    -0.15, 0, -0.1,   -0.9, 0.15, -0.2, -0.15, 0, -0.25,
    -0.15, -0.01, -0.1, -0.15, -0.01, -0.25, -0.9, 0.12, -0.2,
    // RIGHT WING
    0.15, 0, -0.1,    0.15, 0, -0.25,   0.9, 0.15, -0.2,
    0.15, -0.01, -0.1, 0.9, 0.12, -0.2, 0.15, -0.01, -0.25,
    // NECK — angled upward so the crane looks like it's flying with head raised
    0, 0.06, 0.08,      -0.04, 0.02, 0.08, 0, 0.16, 0.42,
    0, 0.06, 0.08,      0, 0.16, 0.42,     0.04, 0.02, 0.08,
    -0.04, 0.02, 0.08, 0.04, 0.02, 0.08,  0, 0.16, 0.42,
    // HEAD — beak curves downward from the raised neck (like a real crane looking forward)
    0, 0.16, 0.42,     -0.02, 0.17, 0.42, 0, 0.12, 0.56,
    0, 0.16, 0.42,     0, 0.12, 0.56,     0.02, 0.17, 0.42,
    // TAIL
    0, -0.06, -0.35,   -0.04, 0.02, -0.35, 0, 0.04, -0.55,
    0, -0.06, -0.35,   0, 0.04, -0.55,     0.04, 0.02, -0.35,
    -0.04, 0.02, -0.35, 0.04, 0.02, -0.35, 0, 0.04, -0.55,
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  geometry.userData.originalPositions = new Float32Array(vertices);

  const material = new THREE.MeshStandardMaterial({
    color: 0xB8CAD8,
    roughness: 0.45,
    metalness: 0.12,
    flatShading: true,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  const edges = new THREE.EdgesGeometry(geometry, 12);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x8A9AAC,
    transparent: true,
    opacity: 0.6,
  });
  const wireframe = new THREE.LineSegments(edges, lineMaterial);
  group.add(wireframe);

  return group;
}

// ── WING + BODY ANIMATION ───────────────────────────────
function animateWings(crane, time, velocityBoost = 0, craneVelY = 0) {
  const mesh = crane.children[0];
  const geo = mesh.geometry;
  const pos = geo.attributes.position.array;
  const orig = geo.userData.originalPositions;
  if (!orig) return;

  // Wings: faster, larger base flutter + secondary harmonic for organic feel
  const baseFlutter = Math.sin(time * 3.5) * 0.08 + Math.sin(time * 7) * 0.02;
  const velFlutter = Math.sin(time * 6) * velocityBoost;
  const wingFlutter = baseFlutter + velFlutter;

  // Left wing tip (vertex 25) and inner (vertex 29)
  pos[25 * 3 + 1] = orig[25 * 3 + 1] + wingFlutter;
  pos[29 * 3 + 1] = orig[29 * 3 + 1] + wingFlutter * 0.8;
  // Right wing tip (vertex 32) and inner (vertex 34)
  pos[32 * 3 + 1] = orig[32 * 3 + 1] + wingFlutter;
  pos[34 * 3 + 1] = orig[34 * 3 + 1] + wingFlutter * 0.8;

  // Tail flutter: subtle sway and vertical oscillation
  const tailFlutterY = Math.sin(time * 3) * 0.015 + Math.sin(time * 5.5) * 0.008;
  const tailSwayX = Math.sin(time * 1.8) * 0.02 * (1 + velocityBoost * 2);
  // Tail tip vertices at indices 53, 55, 59
  pos[53 * 3]     = orig[53 * 3] + tailSwayX;
  pos[53 * 3 + 1] = orig[53 * 3 + 1] + tailFlutterY;
  pos[55 * 3]     = orig[55 * 3] + tailSwayX;
  pos[55 * 3 + 1] = orig[55 * 3 + 1] + tailFlutterY;
  pos[59 * 3]     = orig[59 * 3] + tailSwayX;
  pos[59 * 3 + 1] = orig[59 * 3 + 1] + tailFlutterY;

  // Head bob: subtle vertical oscillation, extra nod when descending
  const headBob = Math.sin(time * 5) * 0.012 + (craneVelY < 0 ? craneVelY * 3 : 0);
  const neckBob = headBob * 0.6;
  // Neck tip vertices at indices 38, 40, 44
  pos[38 * 3 + 1] = orig[38 * 3 + 1] + neckBob;
  pos[40 * 3 + 1] = orig[40 * 3 + 1] + neckBob;
  pos[44 * 3 + 1] = orig[44 * 3 + 1] + neckBob;
  // Head base vertices at 45, 48 also get neck bob
  pos[45 * 3 + 1] = orig[45 * 3 + 1] + neckBob;
  pos[48 * 3 + 1] = orig[48 * 3 + 1] + neckBob;
  // Beak vertices at indices 47, 49
  pos[47 * 3 + 1] = orig[47 * 3 + 1] + headBob;
  pos[49 * 3 + 1] = orig[49 * 3 + 1] + headBob;

  geo.attributes.position.needsUpdate = true;
  geo.computeVertexNormals();
}
