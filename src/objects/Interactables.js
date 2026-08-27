import * as THREE from 'three';
import { sceneManager } from '../scene/SceneManager.js';

// ─────────────────────────────────────────────────────────────────
// Helper: mark a group as interactive with hover text
// ─────────────────────────────────────────────────────────────────
function makeInteractive(group, id, hoverText) {
  group.userData = {
    isInteractive: true,
    id,
    hoverText,
    originalScale: group.scale.clone()
  };
  return group;
}

// ─────────────────────────────────────────────────────────────────
// Helper: smooth rounded box (via scaled sphere for round corners)
// ─────────────────────────────────────────────────────────────────
function roundedBox(w, h, d, mat) {
  // Approximate rounded box using a scaled sphere mesh layered on box
  const geo = new THREE.BoxGeometry(w, h, d, 2, 2, 2);
  return new THREE.Mesh(geo, mat);
}

// ─────────────────────────────────────────────────────────────────
// TEDDY BEAR — warm, plush, premium
// ─────────────────────────────────────────────────────────────────
export function createTeddy() {
  const g = new THREE.Group();

  const fur = new THREE.MeshStandardMaterial({ color: 0xC8956C, roughness: 0.98, metalness: 0 });
  const furLight = new THREE.MeshStandardMaterial({ color: 0xE8C0A0, roughness: 0.98, metalness: 0 });
  const furDark = new THREE.MeshStandardMaterial({ color: 0xA87850, roughness: 0.98, metalness: 0 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1A1008, roughness: 0.5, metalness: 0.1 });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0x3D2010, roughness: 0.6 });
  const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xD4887A, roughness: 0.7, metalness: 0 });

  // Body — slightly chubby sphere
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 16), fur);
  body.scale.set(1, 0.95, 0.9);
  body.position.y = 0.55;
  body.castShadow = true;
  g.add(body);

  // Tummy patch (lighter oval)
  const tummy = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), furLight);
  tummy.scale.set(1, 0.95, 0.35);
  tummy.position.set(0, 0.55, 0.45);
  g.add(tummy);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 16), fur);
  head.scale.set(1, 0.95, 0.92);
  head.position.y = 1.3;
  head.castShadow = true;
  g.add(head);

  // Ears
  [-0.32, 0.32].forEach(x => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 10), fur);
    ear.scale.set(1, 1, 0.65);
    ear.position.set(x, 1.62, 0);
    g.add(ear);
    // Inner ear
    const earIn = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), furLight);
    earIn.scale.set(1, 1, 0.4);
    earIn.position.set(x, 1.62, 0.1);
    g.add(earIn);
  });

  // Face — snout
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), furLight);
  snout.scale.set(1, 0.7, 0.7);
  snout.position.set(0, 1.22, 0.36);
  g.add(snout);

  // Nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), noseMat);
  nose.scale.set(1.2, 0.7, 0.6);
  nose.position.set(0, 1.28, 0.55);
  g.add(nose);

  // Eyes
  [-0.15, 0.15].forEach(x => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), eyeMat);
    eye.position.set(x, 1.38, 0.38);
    g.add(eye);
    // Eye shine
    const shine = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
    );
    shine.position.set(x + 0.02, 1.4, 0.42);
    g.add(shine);
  });

  // Arms
  [-0.62, 0.62].forEach((x, i) => {
    const arm = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), fur);
    arm.scale.set(0.7, 1.2, 0.65);
    arm.position.set(x, 0.78, 0.1);
    arm.rotation.z = i === 0 ? 0.4 : -0.4;
    arm.castShadow = true;
    g.add(arm);
  });

  // Legs
  [-0.25, 0.25].forEach(x => {
    const leg = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), fur);
    leg.scale.set(0.8, 1.1, 0.8);
    leg.position.set(x, 0.12, 0.1);
    leg.castShadow = true;
    g.add(leg);
    // Paw
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), furDark);
    paw.scale.set(1.1, 0.5, 1.3);
    paw.position.set(x, 0.06, 0.3);
    g.add(paw);
  });

  // Ribbon around neck
  const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 8, 24), ribbonMat);
  ribbon.rotation.x = Math.PI / 2;
  ribbon.position.y = 1.0;
  g.add(ribbon);
  // Bow knot
  const bow1 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), ribbonMat);
  bow1.scale.set(1.6, 0.7, 0.5);
  bow1.position.set(0.1, 1.0, 0.3);
  g.add(bow1);
  const bow2 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), ribbonMat);
  bow2.scale.set(1.6, 0.7, 0.5);
  bow2.rotation.z = Math.PI / 3;
  bow2.position.set(0.05, 1.0, 0.3);
  g.add(bow2);

  g.scale.set(0.75, 0.75, 0.75);
  return makeInteractive(g, 'teddy', 'Tap me 👀');
}

// ─────────────────────────────────────────────────────────────────
// PHOTO FRAME — ornate champagne gold
// ─────────────────────────────────────────────────────────────────
export function createPhotoFrame() {
  const g = new THREE.Group();

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xD4A76A, metalness: 0.7, roughness: 0.25
  });
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0xC8955A, metalness: 0.8, roughness: 0.3
  });
  const canvasMat = new THREE.MeshStandardMaterial({ color: 0xFAF5EE, roughness: 0.95 });

  // Outer frame
  const outer = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.6, 0.1), frameMat);
  outer.castShadow = true;
  g.add(outer);

  // Inner bevel (slightly inset darker ring)
  const bevel = new THREE.Mesh(new THREE.BoxGeometry(1.18, 1.48, 0.08), innerMat);
  bevel.position.z = 0.01;
  g.add(bevel);

  // Photo canvas
  const canvas = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.3), canvasMat);
  canvas.position.z = 0.06;
  g.add(canvas);

  // Corner decorations (small spheres)
  const cornerMat = new THREE.MeshStandardMaterial({ color: 0xE8C070, metalness: 0.9, roughness: 0.1 });
  [[-0.55, 0.72], [0.55, 0.72], [-0.55, -0.72], [0.55, -0.72]].forEach(([x, y]) => {
    const corner = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), cornerMat);
    corner.position.set(x, y, 0.06);
    g.add(corner);
  });

  // Small heart detail (top center)
  const heartMat = new THREE.MeshStandardMaterial({ color: 0xD4887A, metalness: 0.3, roughness: 0.5 });
  const heartL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), heartMat);
  heartL.position.set(-0.055, 0.83, 0.06);
  const heartR = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), heartMat);
  heartR.position.set(0.055, 0.83, 0.06);
  g.add(heartL, heartR);

  return makeInteractive(g, 'frame', 'Our Memories ❤️');
}

// ─────────────────────────────────────────────────────────────────
// LETTER / ENVELOPE — cream with wax seal
// ─────────────────────────────────────────────────────────────────
export function createLetter() {
  const g = new THREE.Group();

  const envMat = new THREE.MeshStandardMaterial({ color: 0xFAF0DC, roughness: 0.85 });
  const flapMat = new THREE.MeshStandardMaterial({ color: 0xF0E0C0, roughness: 0.85, side: THREE.DoubleSide });
  const sealMat = new THREE.MeshStandardMaterial({
    color: 0xD4604A, roughness: 0.4, metalness: 0.1,
    emissive: 0x441008, emissiveIntensity: 0.1
  });
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xFFF8F0, roughness: 0.95 });

  // Envelope body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.85), envMat);
  body.castShadow = true;
  g.add(body);

  // Envelope flap (triangle shape approximated with a plane)
  const flapGeo = new THREE.PlaneGeometry(1.2, 0.55);
  const flap = new THREE.Mesh(flapGeo, flapMat);
  flap.position.set(0, 0.03, -0.15);
  flap.rotation.x = -Math.PI / 4;
  g.add(flap);

  // Wax seal
  const sealDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 20), sealMat);
  sealDisc.position.set(0, 0.05, 0);
  g.add(sealDisc);
  // Heart on seal
  const sealHeart = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshStandardMaterial({ color: 0xFF9080 }));
  sealHeart.position.set(0, 0.083, 0.015);
  sealHeart.scale.set(0.8, 0.7, 0.4);
  g.add(sealHeart);

  // Letter peeking out
  const letter = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.45), paperMat);
  letter.position.set(0, 0.05, -0.22);
  letter.rotation.x = -Math.PI / 2 + 0.15;
  g.add(letter);

  // Thin line details on letter
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xE0C8A0, transparent: true, opacity: 0.5 });
  [0.08, 0.0, -0.08].forEach(y => {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.012), lineMat);
    line.position.set(0, 0.06, -0.22 + y * 0.3);
    line.rotation.x = -Math.PI / 2 + 0.15;
    g.add(line);
  });

  return makeInteractive(g, 'letter', 'A letter for you ✉️');
}

// ─────────────────────────────────────────────────────────────────
// RAKHI — premium with gemstone beads and thread
// ─────────────────────────────────────────────────────────────────
export function createRakhi() {
  const g = new THREE.Group();

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xD4AF37, metalness: 0.9, roughness: 0.15,
    emissive: 0x5C4000, emissiveIntensity: 0.08
  });
  const goldDarkMat = new THREE.MeshStandardMaterial({
    color: 0xB8902A, metalness: 0.85, roughness: 0.2
  });
  const threadMat = new THREE.MeshStandardMaterial({ color: 0xE04040, roughness: 0.9 });
  const threadGoldMat = new THREE.MeshStandardMaterial({ color: 0xF0D060, roughness: 0.8 });
  const gemColors = [0xE04080, 0x4080E0, 0x40D080, 0xE0A040, 0xC040E0];

  // Central disc (main medallion)
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 32), goldMat);
  disc.castShadow = true;
  g.add(disc);

  // Raised center dome
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 12), goldMat);
  dome.scale.y = 0.55;
  dome.position.y = 0.05;
  g.add(dome);

  // Mandala ring (outer decorative)
  const mandala = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 32), goldDarkMat);
  mandala.rotation.x = Math.PI / 2;
  mandala.position.y = 0.04;
  g.add(mandala);

  // Petals (decorative lobes around center)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), goldMat);
    petal.scale.set(0.7, 0.4, 1.0);
    petal.position.set(Math.sin(angle) * 0.28, 0.03, Math.cos(angle) * 0.28);
    g.add(petal);
  }

  // Gemstone beads (around rim)
  gemColors.forEach((col, i) => {
    const angle = (i / gemColors.length) * Math.PI * 2 + 0.3;
    const gemMat = new THREE.MeshStandardMaterial({
      color: col, metalness: 0.2, roughness: 0.1,
      emissive: col, emissiveIntensity: 0.12
    });
    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), gemMat);
    gem.position.set(Math.sin(angle) * 0.33, 0.04, Math.cos(angle) * 0.33);
    g.add(gem);
  });

  // Thread bands (left and right) — TubeGeometry along a path
  [-1, 1].forEach(dir => {
    const points = [];
    const segments = 12;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = dir * (0.32 + t * 0.8);
      const y = Math.sin(t * Math.PI * 0.8) * 0.04;
      points.push(new THREE.Vector3(x, y, 0));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const threadGeo = new THREE.TubeGeometry(curve, 12, 0.025, 6, false);

    // Red thread
    const thread = new THREE.Mesh(threadGeo, threadMat);
    g.add(thread);

    // Gold thread alongside
    const points2 = points.map(p => new THREE.Vector3(p.x, p.y + 0.03, p.z));
    const curve2 = new THREE.CatmullRomCurve3(points2);
    const threadGeo2 = new THREE.TubeGeometry(curve2, 12, 0.015, 6, false);
    const thread2 = new THREE.Mesh(threadGeo2, threadGoldMat);
    g.add(thread2);

    // Small beads along thread
    for (let b = 1; b < 5; b++) {
      const t = b / 5;
      const x = dir * (0.32 + t * 0.8);
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), goldMat);
      bead.position.set(x, Math.sin(t * Math.PI * 0.8) * 0.04 + 0.015, 0);
      g.add(bead);
    }
  });

  g.rotation.x = Math.PI / 2; // lay flat
  return makeInteractive(g, 'rakhi', 'The sacred thread ✨');
}

// ─────────────────────────────────────────────────────────────────
// FLOWER VASE — elegant with petals
// ─────────────────────────────────────────────────────────────────
export function createFlowers() {
  const g = new THREE.Group();

  // Vase using LatheGeometry for elegant silhouette
  const points = [];
  const profile = [
    [0.14, 0], [0.18, 0.1], [0.22, 0.25], [0.2, 0.4],
    [0.15, 0.55], [0.1, 0.65], [0.13, 0.7]
  ];
  profile.forEach(([r, y]) => points.push(new THREE.Vector2(r, y)));
  const vaseGeo = new THREE.LatheGeometry(points, 28);
  const vaseMat = new THREE.MeshPhysicalMaterial({
    color: 0xD8E8F8,
    transmission: 0.55,
    transparent: true,
    roughness: 0.08,
    metalness: 0.05,
    ior: 1.45,
    thickness: 0.3,
    opacity: 0.85
  });
  const vase = new THREE.Mesh(vaseGeo, vaseMat);
  vase.position.y = 0;
  vase.castShadow = true;
  g.add(vase);

  // Water inside vase (slightly blue fill)
  const waterGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.3, 20);
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0xC8E0F8, transparent: true, opacity: 0.5, roughness: 0
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = 0.15;
  g.add(water);

  // Stems
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x5A8A50, roughness: 0.9 });
  const stemData = [
    { x: 0,     z: 0,     h: 0.9, tilt: 0 },
    { x: -0.1,  z: 0.08,  h: 0.75, tilt: 0.15 },
    { x: 0.12,  z: -0.05, h: 0.82, tilt: -0.12 },
    { x: -0.05, z: -0.1,  h: 0.68, tilt: 0.1 },
    { x: 0.08,  z: 0.1,   h: 0.78, tilt: -0.08 },
  ];

  stemData.forEach(({ x, z, h, tilt }) => {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.016, h, 8),
      stemMat
    );
    stem.position.set(x, 0.65 + h / 2, z);
    stem.rotation.z = tilt;
    g.add(stem);
  });

  // Flowers (petals using RingGeometry layers)
  const flowerData = [
    { pos: [0, 1.58, 0],     color: 0xE8A8B0, centerColor: 0xF8E080, size: 0.18 },
    { pos: [-0.14, 1.44, 0.1], color: 0xC8B8E0, centerColor: 0xF8D870, size: 0.14 },
    { pos: [0.15, 1.5, -0.1], color: 0xF0C8A0, centerColor: 0xE89050, size: 0.15 },
    { pos: [-0.08, 1.4, -0.12], color: 0xB8D8C0, centerColor: 0xE8F080, size: 0.13 },
    { pos: [0.1, 1.46, 0.12], color: 0xF0B0C0, centerColor: 0xF0E080, size: 0.12 },
  ];

  flowerData.forEach(({ pos, color, centerColor, size }) => {
    const flowerG = new THREE.Group();

    // Petals (6 petals)
    const petalMat = new THREE.MeshStandardMaterial({ color, roughness: 0.95, side: THREE.DoubleSide });
    for (let p = 0; p < 6; p++) {
      const angle = (p / 6) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.SphereGeometry(size * 0.8, 8, 6), petalMat);
      petal.scale.set(0.4, 0.25, 1.0);
      petal.position.set(Math.sin(angle) * size, 0, Math.cos(angle) * size);
      flowerG.add(petal);
    }

    // Center
    const centerMat = new THREE.MeshStandardMaterial({ color: centerColor, roughness: 0.8 });
    const center = new THREE.Mesh(new THREE.SphereGeometry(size * 0.45, 10, 8), centerMat);
    flowerG.add(center);

    flowerG.position.set(...pos);
    flowerG.rotation.x = -Math.PI / 12;
    g.add(flowerG);
  });

  return makeInteractive(g, 'flowers', 'Wait, what\'s this? 🌸');
}

// ─────────────────────────────────────────────────────────────────
// GIFT BOX — cream wrapping with champagne ribbon
// ─────────────────────────────────────────────────────────────────
export function createGiftBox() {
  const g = new THREE.Group();

  const wrapMat = new THREE.MeshStandardMaterial({
    color: 0xFAEFE0, roughness: 0.75, metalness: 0
  });
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: 0xD4A76A, metalness: 0.55, roughness: 0.3
  });
  const bowMat = new THREE.MeshStandardMaterial({
    color: 0xE8C070, metalness: 0.6, roughness: 0.25
  });

  // Box body
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.85, 1.0), wrapMat);
  box.position.y = 0.425;
  box.castShadow = true;
  g.add(box);

  // Lid (slightly larger, sits on top)
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.15, 1.06), wrapMat);
  lid.position.y = 0.925;
  lid.castShadow = true;
  g.add(lid);

  // Ribbon bands
  // Vertical ribbon
  const ribbonV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.08, 1.08), ribbonMat);
  ribbonV.position.y = 0.5;
  g.add(ribbonV);
  // Horizontal ribbon
  const ribbonH = new THREE.Mesh(new THREE.BoxGeometry(1.08, 1.08, 0.12), ribbonMat);
  ribbonH.position.y = 0.5;
  g.add(ribbonH);
  // Ribbon top cross-pieces
  const ribbonTopH = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.12, 0.12), ribbonMat);
  ribbonTopH.position.y = 1.0;
  g.add(ribbonTopH);
  const ribbonTopV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.08), ribbonMat);
  ribbonTopV.position.y = 1.0;
  g.add(ribbonTopV);

  // Bow loops (torus pairs)
  const bowLoop1 = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.055, 8, 20), bowMat);
  bowLoop1.rotation.y = Math.PI / 4;
  bowLoop1.position.set(-0.12, 1.12, 0);
  bowLoop1.castShadow = true;
  g.add(bowLoop1);
  const bowLoop2 = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.055, 8, 20), bowMat);
  bowLoop2.rotation.y = -Math.PI / 4;
  bowLoop2.position.set(0.12, 1.12, 0);
  bowLoop2.castShadow = true;
  g.add(bowLoop2);
  // Bow knot center
  const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), bowMat);
  bowCenter.position.y = 1.12;
  g.add(bowCenter);

  // Ribbon tails
  [Math.PI / 5, -Math.PI / 5, Math.PI / 5 + Math.PI / 2, -Math.PI / 5 + Math.PI / 2].forEach(angle => {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.025), ribbonMat);
    tail.position.set(Math.sin(angle) * 0.25, 0.95, Math.cos(angle) * 0.25);
    tail.rotation.z = angle;
    g.add(tail);
  });

  // Small gift tag
  const tagMat = new THREE.MeshStandardMaterial({ color: 0xFFFBF0, roughness: 0.9 });
  const tag = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.015), tagMat);
  tag.position.set(0.42, 1.08, 0.3);
  tag.rotation.z = 0.3;
  g.add(tag);

  return makeInteractive(g, 'gift', 'A surprise for you 🎁');
}
