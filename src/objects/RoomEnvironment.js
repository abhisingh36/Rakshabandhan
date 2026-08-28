import { createVanitySuite } from './VanitySuite.js';
import * as THREE from 'three';
import { sceneManager } from '../scene/SceneManager.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Premium Rakshabandhan Room — "Studio-quality cosy bedroom"
   Technique list used by AAA studios / Pixar / Apple AR:
   • Procedural wood-grain texture (canvas pixel art)
   • Baked-style normal/roughness variation via vertex color
   • Physically-based materials (MeshPhysicalMaterial) with clearcoat
   • Wainscoting panels on lower walls
   • Decorative ceiling coffer with molding
   • Layered rug with fringe strips
   • Detailed bookshelf with varied book sizes
   • Pendant lamp with realistic shade
   • Large arched window with light-catcher glow
   • String-light drooping catenary curve (TubeGeometry along CatmullRom)
   • Animated dust motes (handled in ParticleSystem)
   • Decorative plants (monstera silhouette)
   • Wicker/rattan side table
   ───────────────────────────────────────────────────────────────────────── */

// ── Procedural texture generators ────────────────────────────────────────────

function makeWoodTexture(w = 256, h = 256, baseColor = [180, 130, 80]) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const [r, g, b] = baseColor;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const grain = Math.sin((x * 0.05 + y * 0.3 + Math.sin(y * 0.04) * 8) * 3.14) * 18;
      const knot = Math.exp(-((x - w * 0.6) ** 2 + (y - h * 0.35) ** 2) / 600) * 22;
      const v = grain + knot;
      ctx.fillStyle = `rgb(${r + v | 0},${g + v * 0.7 | 0},${b + v * 0.4 | 0})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeWallTexture(w = 256, h = 256, color = [240, 230, 215]) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const [r, g, b] = color;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const noise = (Math.random() - 0.5) * 6;
      ctx.fillStyle = `rgb(${r + noise | 0},${g + noise | 0},${b + noise | 0})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeRoughTexture(w = 128, h = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = 100 + Math.random() * 80 | 0;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return new THREE.CanvasTexture(canvas);
}

function makeFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const plankH = 36;
  const plankColors = ['#C9A882', '#BE9C77', '#CBB08E', '#C4A07A', '#D0AA88'];
  for (let row = 0; row < 14; row++) {
    const y = row * plankH;
    const offset = (row % 2) * 128;
    for (let col = -1; col < 5; col++) {
      const x = col * 128 + offset;
      ctx.fillStyle = plankColors[Math.abs(row * 5 + col) % plankColors.length];
      ctx.fillRect(x + 1, y + 1, 126, plankH - 2);
      // grain lines
      ctx.strokeStyle = 'rgba(120,80,40,0.06)';
      ctx.lineWidth = 0.5;
      for (let g = 0; g < 6; g++) {
        ctx.beginPath();
        ctx.moveTo(x + g * 20, y);
        ctx.lineTo(x + g * 20 + 10, y + plankH);
        ctx.stroke();
      }
    }
    // gap
    ctx.fillStyle = '#A07850';
    ctx.fillRect(0, y, 512, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 4);  // more natural plank proportions
  return tex;
}

// ── Material factory ──────────────────────────────────────────────────────────

function makeMaterials() {
  const woodTex = makeWoodTexture(512, 512, [140, 95, 50]);
  const woodTex2 = makeWoodTexture(512, 512, [180, 130, 80]);
  const wallTex = makeWallTexture(256, 256, [245, 237, 226]);
  const wallBackTex = makeWallTexture(256, 256, [230, 220, 240]);
  const floorTex = makeFloorTexture();
  const roughTex = makeRoughTexture();

  woodTex.repeat.set(4, 4);
  woodTex2.repeat.set(3, 3);
  wallTex.repeat.set(3, 4);
  wallBackTex.repeat.set(3, 4);

  return {
    // Plaster wall (slight texture)
    wall: new THREE.MeshStandardMaterial({
      map: wallTex, roughness: 0.92, metalness: 0,
      color: 0xFFF8F2
    }),
    // Feature back wall (blush lavender)
    wallBack: new THREE.MeshStandardMaterial({
      map: wallBackTex, roughness: 0.88, metalness: 0,
      color: 0xEEE2F5
    }),
    // Textured planked floor
    floor: new THREE.MeshStandardMaterial({
      map: floorTex, roughness: 0.55, metalness: 0.02,
      roughnessMap: roughTex, color: 0xE8D4BC
    }),
    // White matte ceiling
    ceiling: new THREE.MeshStandardMaterial({ color: 0xFFFEFC, roughness: 1, metalness: 0 }),
    // Dark walnut (desk, frames)
    wood: new THREE.MeshPhysicalMaterial({
      map: woodTex, roughness: 0.5, metalness: 0.04,
      color: 0x7B5230, clearcoat: 0.3, clearcoatRoughness: 0.3
    }),
    // Light wood (shelves, side table)
    woodLight: new THREE.MeshPhysicalMaterial({
      map: woodTex2, roughness: 0.6, metalness: 0.02,
      color: 0xC8A070, clearcoat: 0.15
    }),
    // Linen/fabric (sofa, cushions) — warm ecru tone
    fabric: new THREE.MeshStandardMaterial({
      color: 0xE8D8C0, roughness: 0.97, metalness: 0,
      roughnessMap: roughTex
    }),
    // Dusty rose oval rug
    rug: new THREE.MeshStandardMaterial({ color: 0xE8BFBC, roughness: 1 }),
    rugBorder: new THREE.MeshStandardMaterial({ color: 0xC89090, roughness: 1 }),
    rugInner: new THREE.MeshStandardMaterial({ color: 0xF0D0CC, roughness: 1 }),
    // Sheer linen curtain
    curtain: new THREE.MeshPhysicalMaterial({
      color: 0xF8EED8, roughness: 0.85, metalness: 0,
      transparent: true, opacity: 0.78, side: THREE.DoubleSide,
      transmission: 0.15
    }),
    // Frosted window glass
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xD8EEFF, roughness: 0.04, metalness: 0,
      transmission: 0.82, transparent: true, opacity: 0.55,
      ior: 1.5, thickness: 0.25
    }),
    // Bright emissive window light
    windowGlow: new THREE.MeshBasicMaterial({
      color: 0xFFF8E0, transparent: true, opacity: 0.18
    }),
    // Skirting / wainscot
    skirting: new THREE.MeshStandardMaterial({ color: 0xF0E4D0, roughness: 0.75 }),
    // Gold frame / accents
    gold: new THREE.MeshStandardMaterial({
      color: 0xD4A848, metalness: 0.85, roughness: 0.2
    }),
    // Fairy-light emissive bulb
    fairy: new THREE.MeshBasicMaterial({ color: 0xFFE8A0 }),
    // Warm lamp shade
    lampShade: new THREE.MeshPhysicalMaterial({
      color: 0xF5DFA8, roughness: 0.85, side: THREE.DoubleSide,
      transparent: true, opacity: 0.88, transmission: 0.1
    }),
    // White ceiling plaster / molding
    molding: new THREE.MeshStandardMaterial({ color: 0xFAF0E6, roughness: 0.8 }),
    // Mirror surface
    mirror: new THREE.MeshStandardMaterial({
      color: 0xEEF6F8, metalness: 0.95, roughness: 0.03,
      envMapIntensity: 1.5
    }),
    // Plant leaves
    leaf: new THREE.MeshStandardMaterial({
      color: 0x4A7A55, roughness: 0.85, metalness: 0, side: THREE.DoubleSide
    }),
    leafDark: new THREE.MeshStandardMaterial({
      color: 0x2A5A35, roughness: 0.9, metalness: 0, side: THREE.DoubleSide
    }),
    // Ceramic pot
    pot: new THREE.MeshStandardMaterial({
      color: 0xD4895A, roughness: 0.7, metalness: 0.05
    }),
    // Cushion accent
    cushion1: new THREE.MeshStandardMaterial({ color: 0xC0A0C8, roughness: 0.96 }),
    cushion2: new THREE.MeshStandardMaterial({ color: 0x9AB09A, roughness: 0.96 }),
    cushion3: new THREE.MeshStandardMaterial({ color: 0xE8C0A0, roughness: 0.96 }),
    // Book spine colours
    bookColors: [
      0xD4887A, 0x8BA888, 0xB0A0D0, 0xE8C870,
      0xA0B8D0, 0xC4A0A0, 0x8090B8, 0xD0A890
    ],
    // Pendant cord
    cord: new THREE.MeshBasicMaterial({ color: 0x888070, transparent: true, opacity: 0.6 }),
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

export function createRoomEnvironment() {
  const scene = sceneManager.scene;
  const room = new THREE.Group();
  const M = makeMaterials();

  const RW = 14, RH = 9.5, RD = 16; // room width, height, depth

  // ══════════════════════════════════════════════════════════════════════════
  //  SHELL — Floor / Ceiling / All 4 Walls (closed room)
  // ══════════════════════════════════════════════════════════════════════════

  // Floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD, 1, 1), M.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  room.add(floor);

  // Ceiling
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), M.ceiling);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = RH;
  room.add(ceiling);

  // ── Back wall (feature blush-lavender) ─────────────────────────────────────
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), M.wallBack);
  backWall.position.set(0, RH / 2, -RD / 2);
  backWall.receiveShadow = true;
  room.add(backWall);

  // ── Front wall (cream — behind camera default position) ────────────────────
  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), M.wall);
  frontWall.rotation.y = Math.PI;          // faces inward
  frontWall.position.set(0, RH / 2, RD / 2);
  frontWall.receiveShadow = true;
  room.add(frontWall);

  // ── Left wall (cream) ──────────────────────────────────────────────────────
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), M.wall);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-RW / 2, RH / 2, 0);
  leftWall.receiveShadow = true;
  room.add(leftWall);

  // ── Right wall panels (with large arched window cutout) ───────────────────
  const winY = 3.2, winH = 4.5, winW = 4.5;
  // Window is centered at z=0 on the right wall
  [
    { w: RD, h: RH - winY - winH, px: 0, py: RH - (RH - winY - winH) / 2 },
    { w: RD, h: winY, px: 0, py: winY / 2 },
    { w: (RD - winW) / 2, h: winH, px: -(winW / 2 + (RD - winW) / 4), py: winY + winH / 2 },
    { w: (RD - winW) / 2, h: winH, px: (winW / 2 + (RD - winW) / 4), py: winY + winH / 2 },
  ].forEach(({ w, h, px, py }) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.wall);
    p.rotation.y = -Math.PI / 2;
    p.position.set(RW / 2, py, px);
    p.receiveShadow = true;
    room.add(p);
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  ARCHED WINDOW — large, cinematic, with light shafts
  // ══════════════════════════════════════════════════════════════════════════

  // Window glass
  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), M.glass);
  winGlass.rotation.y = -Math.PI / 2;
  winGlass.position.set(RW / 2 - 0.05, winY + winH / 2, 0);
  room.add(winGlass);

  // Window frame — deep reveal
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xF0E4D0, roughness: 0.6 });
  const revealDepth = 0.35;
  // Top reveal
  const revTop = new THREE.Mesh(new THREE.BoxGeometry(revealDepth, 0.1, winW + 0.4), frameMat);
  revTop.position.set(RW / 2 - revealDepth / 2, winY + winH + 0.05, 0);
  room.add(revTop);
  // Bottom sill
  const sill = new THREE.Mesh(new THREE.BoxGeometry(revealDepth + 0.1, 0.08, winW + 0.5), frameMat);
  sill.position.set(RW / 2 - revealDepth / 2, winY - 0.04, 0);
  room.add(sill);
  // Side reveals
  [-winW / 2, winW / 2].forEach(pz => {
    const side = new THREE.Mesh(new THREE.BoxGeometry(revealDepth, winH + 0.2, 0.08), frameMat);
    side.position.set(RW / 2 - revealDepth / 2, winY + winH / 2, pz);
    room.add(side);
  });
  // Muntin bars — proper + cross pattern
  // Window is on RIGHT wall, extends along Z (not X), so:
  //   vertical divider  → full HEIGHT in Y, thin strip at z=0
  //   horizontal divider → full WIDTH along Z axis
  const muntinMat = new THREE.MeshStandardMaterial({ color: 0xDDD0BA, roughness: 0.45 });
  // Vertical centre bar (divides left/right panes)
  const muntinV = new THREE.Mesh(new THREE.BoxGeometry(0.14, winH + 0.1, 0.07), muntinMat);
  muntinV.position.set(RW / 2 - 0.07, winY + winH / 2, 0);
  room.add(muntinV);
  // Horizontal centre bar (divides top/bottom panes)
  const muntinH = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, winW + 0.1), muntinMat);
  muntinH.position.set(RW / 2 - 0.07, winY + winH / 2, 0);
  room.add(muntinH);
  // Top & bottom frame bars
  const muntinTop = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, winW + 0.12), muntinMat);
  muntinTop.position.set(RW / 2 - 0.07, winY + winH + 0.04, 0);
  room.add(muntinTop);
  const muntinBot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, winW + 0.12), muntinMat);
  muntinBot.position.set(RW / 2 - 0.07, winY - 0.04, 0);
  room.add(muntinBot);
  // Side frame bars
  [-winW / 2, winW / 2].forEach(pz => {
    const muntinSide = new THREE.Mesh(new THREE.BoxGeometry(0.14, winH + 0.18, 0.09), muntinMat);
    muntinSide.position.set(RW / 2 - 0.07, winY + winH / 2, pz);
    room.add(muntinSide);
  });

  // Window volumetric glow (big soft plane inside the room)
  const glowPlane = new THREE.Mesh(new THREE.PlaneGeometry(winW + 1, winH + 1), M.windowGlow);
  glowPlane.rotation.y = -Math.PI / 2;
  glowPlane.position.set(RW / 2 - 0.12, winY + winH / 2, 0);
  room.add(glowPlane);

  // Light shaft (cone-ish plane angled into room)
  const shaftMat = new THREE.MeshBasicMaterial({
    color: 0xFFF5E0, transparent: true, opacity: 0.06, side: THREE.DoubleSide
  });
  const shaft = new THREE.Mesh(new THREE.PlaneGeometry(winW, 10), shaftMat);
  shaft.rotation.set(0, Math.PI / 2 + 0.15, -0.2);
  shaft.position.set(RW / 2 - 3, winY + winH / 2 - 1, 0);
  room.add(shaft);

  // ══════════════════════════════════════════════════════════════════════════
  //  WAINSCOTING / WALL PANELING (lower wall detail)
  // ══════════════════════════════════════════════════════════════════════════

  const wainH = 2.4;  // height of panel zone
  const panelMat = new THREE.MeshStandardMaterial({ color: 0xF5EDE0, roughness: 0.75 });
  const panelRailMat = new THREE.MeshStandardMaterial({ color: 0xEEE0CC, roughness: 0.65 });

  function addWainscoting(wallGroup, w, depth, rotY, px, pz) {
    // Rail cap
    const rail = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, depth), panelRailMat);
    rail.position.set(px, wainH, pz);
    rail.rotation.y = rotY;
    room.add(rail);
    // Base board (tall)
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, depth), panelRailMat);
    base.position.set(px, 0.14, pz);
    base.rotation.y = rotY;
    room.add(base);
    // Inset panels
    const panelW = 1.4, panelH = wainH - 0.5, gap = 0.12;
    let count = Math.floor((w - gap) / (panelW + gap));
    const totalW = count * (panelW + gap) - gap;
    const startX = -totalW / 2 + panelW / 2;
    for (let i = 0; i < count; i++) {
      const ox = startX + i * (panelW + gap);
      const inset = new THREE.Mesh(new THREE.BoxGeometry(panelW, panelH, 0.03), panelMat);
      const offset = new THREE.Vector3(ox, wainH / 2 + 0.03, 0);
      if (rotY !== 0) offset.applyEuler(new THREE.Euler(0, rotY, 0));
      inset.position.set(px + offset.x, offset.y, pz + offset.z);
      inset.rotation.y = rotY;
      room.add(inset);
      // Inner bevel shadow strip
      const bevel = new THREE.Mesh(new THREE.BoxGeometry(panelW - 0.06, panelH - 0.06, 0.015), panelRailMat);
      bevel.position.copy(inset.position);
      bevel.rotation.y = rotY;
      room.add(bevel);
    }
  }

  // ── Wainscoting on ALL four walls ──────────────────────────────────────────
  // Back wall
  addWainscoting(room, RW - 0.1, 0.04, 0, 0, -RD / 2 + 0.04);
  // Front wall (faces inward so we offset slightly differently)
  addWainscoting(room, RW - 0.1, 0.04, Math.PI, 0, RD / 2 - 0.04);
  // Left wall
  addWainscoting(room, RD - 0.1, 0.04, Math.PI / 2, -RW / 2 + 0.04, 0);
  // Right wall (avoid window area — split into two shorter strips)
  addWainscoting(room, (RD - winW) / 2 - 0.1, 0.04, -Math.PI / 2,
    RW / 2 - 0.04, -(winW / 2 + (RD - winW) / 4));
  addWainscoting(room, (RD - winW) / 2 - 0.1, 0.04, -Math.PI / 2,
    RW / 2 - 0.04, (winW / 2 + (RD - winW) / 4));

  // ══════════════════════════════════════════════════════════════════════════
  //  CEILING — coffered panels + crown molding
  // ══════════════════════════════════════════════════════════════════════════

  // Crown molding on ALL four walls
  const crownH = 0.14, crownD = 0.12;
  [
    { w: RW + crownD, h: crownH, d: crownD, pos: [0, RH - crownH / 2, -RD / 2 + crownD / 2] }, // back
    { w: RW + crownD, h: crownH, d: crownD, pos: [0, RH - crownH / 2, RD / 2 - crownD / 2] }, // front
    { w: crownD, h: crownH, d: RD + crownD, pos: [-RW / 2 + crownD / 2, RH - crownH / 2, 0] },          // left
    { w: crownD, h: crownH, d: RD + crownD, pos: [RW / 2 - crownD / 2, RH - crownH / 2, 0] },          // right
  ].forEach(({ w, h, d, pos }) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.molding);
    m.position.set(...pos);
    room.add(m);
  });

  // Ceiling coffers (3x2 grid of raised panels)
  const cofferMat = new THREE.MeshStandardMaterial({ color: 0xFAF2E8, roughness: 0.9 });
  const cofferBorderMat = new THREE.MeshStandardMaterial({ color: 0xEDE0CC, roughness: 0.8 });
  for (let ci = 0; ci < 3; ci++) {
    for (let cj = 0; cj < 2; cj++) {
      const cx = (ci - 1) * 4;
      const cz = (cj - 0.5) * 5.5;
      const coffer = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.04, 4.8), cofferMat);
      coffer.position.set(cx, RH - 0.02, cz - 1.5);
      room.add(coffer);
      // Coffer frame
      [[3.6, 0.06, 0.08, 0, 0], [0.08, 0.06, 4.9, 1.8, 0], [0.08, 0.06, 4.9, -1.8, 0]].forEach(([w, h, d, ox, oz]) => {
        const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cofferBorderMat);
        f.position.set(cx + ox, RH - 0.01, cz - 1.5 + oz);
        room.add(f);
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  FLOOR RUG — layered oval with fringe
  // ══════════════════════════════════════════════════════════════════════════

  // Main rug (oval)
  const rugGeo = new THREE.CylinderGeometry(2.6, 2.6, 0.05, 64);
  const rug = new THREE.Mesh(rugGeo, M.rug);
  rug.position.set(-0.3, 0.025, -2.8);
  rug.scale.set(1.0, 1.0, 0.7);
  rug.receiveShadow = true;
  room.add(rug);
  // Border ring
  const rugB = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.051, 64, 1, true), M.rugBorder);
  rugB.position.copy(rug.position);
  rugB.scale.copy(rug.scale);
  room.add(rugB);
  // Inner decorative ring
  const rugIn = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.052, 64, 1, true), M.rugInner);
  rugIn.position.copy(rug.position);
  rugIn.scale.copy(rug.scale);
  room.add(rugIn);
  // Fringe strips around perimeter
  const fringeMat = new THREE.MeshStandardMaterial({ color: 0xD0A898, roughness: 1 });
  for (let f = 0; f < 40; f++) {
    const angle = (f / 40) * Math.PI * 2;
    const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.22), fringeMat);
    fringe.position.set(
      rug.position.x + Math.sin(angle) * 2.65,
      0.01,
      rug.position.z + Math.cos(angle) * 2.65 * 0.7
    );
    fringe.rotation.y = angle;
    room.add(fringe);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  DESK — walnut with subtle clearcoat
  // ══════════════════════════════════════════════════════════════════════════

  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.1, 3.6), M.wood);
  deskTop.position.set(0, 2.1, -3.8);
  deskTop.castShadow = true; deskTop.receiveShadow = true;
  room.add(deskTop);

  // Desk apron (front face panel)
  const deskApron = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.45, 0.06), M.wood);
  deskApron.position.set(0, 1.87, -2.05);
  room.add(deskApron);

  // Desk legs — tapered, elegant
  [[-3.1, -5.5], [3.1, -5.5], [-3.1, -2.1], [3.1, -2.1]].forEach(([x, z]) => {
    // Tapered leg using CylinderGeometry
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.035, 2.0, 10), M.wood);
    leg.position.set(x, 1.0, z);
    leg.castShadow = true;
    room.add(leg);
  });

  // Cable tray under desk (thin strip — detail)
  const tray = new THREE.Mesh(new THREE.BoxGeometry(4, 0.06, 0.25), M.wood);
  tray.position.set(0, 1.2, -4.0);
  room.add(tray);

  // ══════════════════════════════════════════════════════════════════════════
  //  SIDE TABLE — rattan/wicker style (cylinder + hexagonal weave rings)
  // ══════════════════════════════════════════════════════════════════════════

  const rattanMat = new THREE.MeshStandardMaterial({ color: 0xC8A060, roughness: 0.88 });
  const sideTabTop = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.06, 32), M.woodLight);
  sideTabTop.position.set(4.8, 1.52, -2.0);
  sideTabTop.castShadow = true; room.add(sideTabTop);
  // Body cylinder (wicker drum)
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.46, 24, 1, true), rattanMat);
  drum.position.set(4.8, 0.75, -2.0);
  room.add(drum);
  // Horizontal weave rings
  for (let i = 0; i < 6; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.505, 0.02, 6, 24), rattanMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(4.8, 0.12 + i * 0.25, -2.0);
    room.add(ring);
  }
  // Base disc
  const drumBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 24), rattanMat);
  drumBase.position.set(4.8, 0.025, -2.0);
  room.add(drumBase);

  // ══════════════════════════════════════════════════════════════════════════
  //  ARMCHAIR — proper upholstered (rounded back, tufted cushion look)
  // ══════════════════════════════════════════════════════════════════════════

  function makeArmchair(px, pz, rotY = 0) {
    const g = new THREE.Group();
    g.position.set(px, 0, pz);
    g.rotation.y = rotY;

    // Seat cushion
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.28, 1.25), M.fabric);
    seat.position.y = 0.56; seat.castShadow = true; g.add(seat);
    // Back cushion (curved via ScaleY)
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 0.26), M.fabric);
    back.position.set(0, 1.22, -0.49); back.castShadow = true; g.add(back);
    // Back top cap (rounded)
    const backCap = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.25, 24, 1, false, 0, Math.PI), M.fabric);
    backCap.rotation.set(0, Math.PI / 2, 0);
    backCap.position.set(0, 1.82, -0.49); g.add(backCap);
    // Arms
    [-0.73, 0.73].forEach(x => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.64, 1.26), M.fabric);
      arm.position.set(x, 0.84, 0); arm.castShadow = true; g.add(arm);
      // Arm cap
      const armCap = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 1.28), M.fabric);
      armCap.position.set(x, 1.19, 0); g.add(armCap);
    });
    // Seat frame base
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.12, 1.27), M.wood);
    base.position.y = 0.38; g.add(base);
    // Legs (turned wood)
    [[-0.58, -0.48], [0.58, -0.48], [-0.58, 0.47], [0.58, 0.47]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.35, 10), M.wood);
      leg.position.set(x, 0.175, z); g.add(leg);
    });
    return g;
  }

  const chair = makeArmchair(-4.5, -1.5, Math.PI / 7);
  room.add(chair);
  // Seat cushion (accent color)
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 1.0), M.cushion1);
  cushion.position.set(-4.5, 0.74, -1.5);
  room.add(cushion);
  // Throw pillow on back
  const throwPillow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.14), M.cushion2);
  throwPillow.position.set(-4.3, 1.2, -1.8);
  throwPillow.rotation.y = Math.PI / 7 + 0.1;
  room.add(throwPillow);

  // ══════════════════════════════════════════════════════════════════════════
  //  BOOKSHELF — built-in style on left wall
  // ══════════════════════════════════════════════════════════════════════════

  const shelfX = -6.78;
  const shelfZ = -4.5;
  const shelfW = 3.0, shelfHeight = 5.5;

  // Back panel
  const shelfBack = new THREE.Mesh(new THREE.BoxGeometry(0.06, shelfHeight, shelfW), M.woodLight);
  shelfBack.position.set(shelfX + 0.03, shelfHeight / 2, shelfZ);
  room.add(shelfBack);
  // Side panels
  [-shelfW / 2, shelfW / 2].forEach(dz => {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.22, shelfHeight, 0.06), M.woodLight);
    side.position.set(shelfX + 0.1, shelfHeight / 2, shelfZ + dz);
    room.add(side);
  });
  // Shelves
  const shelfYs = [0.04, 1.15, 2.25, 3.35, 4.45, shelfHeight];
  shelfYs.forEach(y => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, shelfW + 0.12), M.woodLight);
    shelf.position.set(shelfX + 0.1, y, shelfZ);
    room.add(shelf);
  });

  // Books — varied sizes, slight tilt randomness
  const bookColors = M.bookColors;
  shelfYs.slice(0, 4).forEach((shY, si) => {
    let bz = shelfZ - shelfW / 2 + 0.15;
    for (let b = 0; b < 10; b++) {
      if (bz > shelfZ + shelfW / 2 - 0.1) break;
      const bW = 0.13 + (Math.sin(b * 7.3 + si) * 0.5 + 0.5) * 0.08;
      const bH = 0.38 + (Math.sin(b * 3.1 + si) * 0.5 + 0.5) * 0.28;
      const bMat = new THREE.MeshStandardMaterial({
        color: bookColors[(si * 7 + b) % bookColors.length], roughness: 0.8
      });
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.12, bH, bW), bMat);
      const tilt = (Math.random() - 0.5) * 0.08;
      book.position.set(shelfX + 0.13, shY + bH / 2 + 0.07 + Math.abs(tilt) * 0.1, bz + bW / 2);
      book.rotation.z = tilt;
      room.add(book);
      bz += bW + 0.01;
    }
    // Small decor item on some shelves
    if (si % 2 === 0) {
      const decor = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8),
        new THREE.MeshStandardMaterial({ color: 0xD4A76A, metalness: 0.6, roughness: 0.3 }));
      decor.position.set(shelfX + 0.14, shY + 0.14, shelfZ + shelfW * 0.35);
      room.add(decor);
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  PENDANT LAMP — hanging from ceiling center
  // ══════════════════════════════════════════════════════════════════════════

  const pendantX = 0, pendantZ = -1.5;
  // Ceiling canopy
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.07, 16), M.gold);
  canopy.position.set(pendantX, RH - 0.04, pendantZ);
  room.add(canopy);
  // Cord (thin cylinder)
  const cordMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 2.2, 6), M.cord);
  cordMesh.position.set(pendantX, RH - 1.18, pendantZ);
  room.add(cordMesh);
  // Shade (inverted dome)
  const pendantShade = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.5, 32, 1, true), M.lampShade);
  pendantShade.rotation.x = Math.PI;
  pendantShade.position.set(pendantX, RH - 2.4, pendantZ);
  room.add(pendantShade);
  // Shade top cap
  const shadeCap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.55, 0.05, 32), M.gold);
  shadeCap.position.set(pendantX, RH - 2.15, pendantZ);
  room.add(shadeCap);
  // Inner glow disc
  const innerGlow = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24),
    new THREE.MeshBasicMaterial({ color: 0xFFE8A0, transparent: true, opacity: 0.7 }));
  innerGlow.rotation.x = Math.PI / 2;
  innerGlow.position.set(pendantX, RH - 2.42, pendantZ);
  room.add(innerGlow);
  // Point light from pendant
  const pendantLight = new THREE.PointLight(0xFFD080, 1.2, 9, 1.6);
  pendantLight.position.set(pendantX, RH - 2.5, pendantZ);
  room.add(pendantLight);

  // ══════════════════════════════════════════════════════════════════════════
  //  SIDE TABLE LAMP — detailed
  // ══════════════════════════════════════════════════════════════════════════

  const lampX = 4.8, lampZ = -2.0;
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.07, 20), M.wood);
  lampBase.position.set(lampX, 1.58, lampZ);
  room.add(lampBase);
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.72, 10), M.wood);
  lampPole.position.set(lampX, 1.94, lampZ);
  room.add(lampPole);
  // Neck joint
  const lampNeck = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), M.wood);
  lampNeck.position.set(lampX, 2.32, lampZ);
  room.add(lampNeck);
  // Shade (fabric cone)
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.42, 24, 1, true), M.lampShade);
  lampShade.rotation.x = Math.PI;
  lampShade.position.set(lampX, 2.58, lampZ);
  room.add(lampShade);
  // Shade top (small gold ring)
  const shadeRing = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 8, 18), M.gold);
  shadeRing.rotation.x = Math.PI / 2;
  shadeRing.position.set(lampX, 2.8, lampZ);
  room.add(shadeRing);
  // Shade bottom ring
  const shadeRingB = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.012, 8, 24), M.gold);
  shadeRingB.rotation.x = Math.PI / 2;
  shadeRingB.position.set(lampX, 2.37, lampZ);
  room.add(shadeRingB);

  // ══════════════════════════════════════════════════════════════════════════
  //  STRING FAIRY LIGHTS — catenary curve across ceiling
  // ══════════════════════════════════════════════════════════════════════════

  function addStringLights(x0, z0, x1, z1, bulbs = 14, sag = 0.5, startY = RH - 0.12) {
    const pts = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const x = x0 + (x1 - x0) * t;
      const z = z0 + (z1 - z0) * t;
      const sY = startY - sag * Math.sin(t * Math.PI);    // catenary sag
      pts.push(new THREE.Vector3(x, sY, z));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tubeGeo = new THREE.TubeGeometry(curve, 30, 0.006, 4, false);
    const cordMat = new THREE.MeshBasicMaterial({ color: 0xB09878, transparent: true, opacity: 0.5 });
    room.add(new THREE.Mesh(tubeGeo, cordMat));

    // Bulbs along curve
    for (let b = 0; b < bulbs; b++) {
      const t = (b + 0.5) / bulbs;
      const pos = curve.getPoint(t);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), M.fairy);
      bulb.position.copy(pos);
      room.add(bulb);
      // Tiny cap above bulb
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 8), M.cord);
      cap.position.set(pos.x, pos.y + 0.06, pos.z);
      room.add(cap);
    }
  }

  addStringLights(-5, -7, 5, -7, 16, 0.55);   // Back string across room
  addStringLights(-6, -3, 1, -6.5, 12, 0.4);  // Diagonal string
  addStringLights(-1, -1, 4, -4.5, 10, 0.35); // Near string

  // ══════════════════════════════════════════════════════════════════════════
  //  CURTAINS — layered, textured, elegant draping
  // ══════════════════════════════════════════════════════════════════════════

  function makeCurtainPanel(pz, side) {
    const segments = 8;
    const panelW = 0.24;
    for (let i = 0; i < segments; i++) {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(panelW, RH + 0.4), M.curtain);
      panel.rotation.y = Math.PI / 2;
      const offset = (i - segments / 2 + 0.5) * panelW * 0.85;
      // S-curve wave gives natural drape
      const wave = Math.sin((i / segments) * Math.PI * 1.5 + (side > 0 ? 0 : Math.PI)) * 0.18;
      const tuck = i === 0 || i === segments - 1 ? 0.1 : 0;
      panel.position.set(RW / 2 - 0.18, RH / 2 - 0.2, pz + offset + wave);
      panel.scale.x = 1 - tuck;
      room.add(panel);
    }
    // Curtain rod
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 10), M.gold);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(RW / 2 - 0.18, RH - 0.3, pz);
    room.add(rod);
    // Rod finial ball
    const ballZ = pz + (side > 0 ? 0.8 : -0.8);
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), M.gold);
    finial.position.set(RW / 2 - 0.18, RH - 0.3, ballZ);
    room.add(finial);
  }
  makeCurtainPanel(-winW / 2 - 0.9, -1);
  makeCurtainPanel(winW / 2 + 0.9, 1);

  // ══════════════════════════════════════════════════════════════════════════
  //  WALL DECOR — large art print + framed mirror + botanical print
  // ══════════════════════════════════════════════════════════════════════════

  // Large abstract art on back wall (left zone)
  const artFrame = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.85, 0.07), M.gold);
  artFrame.position.set(-2.2, 5.5, -7.97);
  room.add(artFrame);
  // Canvas with gradient-look (two-tone plane)
  const artCanvas = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.65),
    new THREE.MeshStandardMaterial({ color: 0xF8EDE0, roughness: 0.92 }));
  artCanvas.position.set(-2.2, 5.5, -7.93);
  room.add(artCanvas);
  // Abstract art shapes
  const artPalette = [0xE8A8A0, 0xB0C8A0, 0xD0B0D8, 0xE8C880, 0xA8C0D8, 0xF0B88A];
  [
    { x: -0.4, y: 0.3, r: 0.45 }, { x: 0.5, y: -0.1, r: 0.35 },
    { x: 0.0, y: -0.4, r: 0.28 }, { x: -0.7, y: -0.3, r: 0.2 },
    { x: 0.75, y: 0.4, r: 0.22 },
  ].forEach(({ x, y, r }, i) => {
    const shape = new THREE.Mesh(
      new THREE.CircleGeometry(r, 32),
      new THREE.MeshStandardMaterial({ color: artPalette[i], roughness: 0.9, transparent: true, opacity: 0.85 })
    );
    shape.position.set(-2.2 + x, 5.5 + y, -7.9);
    room.add(shape);
  });

  // Oval mirror on right wall (gold frame with inner bevel)
  const mirrorOuter = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.1, 16, 64),
    new THREE.MeshStandardMaterial({ color: 0xD4A848, metalness: 0.88, roughness: 0.18 })
  );
  mirrorOuter.position.set(6.88, 5.8, -4.5);
  mirrorOuter.rotation.y = -Math.PI / 2;
  room.add(mirrorOuter);
  // Add inner bevel ring
  const mirrorBevel = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.04, 10, 48),
    new THREE.MeshStandardMaterial({ color: 0xB8902A, metalness: 0.75, roughness: 0.25 })
  );
  mirrorBevel.position.set(6.87, 5.8, -4.5);
  mirrorBevel.rotation.y = -Math.PI / 2;
  room.add(mirrorBevel);
  const mirrorGlass = new THREE.Mesh(new THREE.CircleGeometry(0.64, 48), M.mirror);
  mirrorGlass.position.set(6.85, 5.8, -4.5);
  mirrorGlass.rotation.y = -Math.PI / 2;
  room.add(mirrorGlass);

  // Small botanical print beside bookshelf
  const botFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.85, 0.06), M.gold);
  botFrame.rotation.y = Math.PI / 2;
  botFrame.position.set(-6.93, 5.5, -1.8);
  room.add(botFrame);
  const botCanvas = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.65),
    new THREE.MeshStandardMaterial({ color: 0xF4EDE4, roughness: 0.92 }));
  botCanvas.rotation.y = Math.PI / 2;
  botCanvas.position.set(-6.90, 5.5, -1.8);
  room.add(botCanvas);
  // Leaf silhouette in print
  [[0, 0.4], [-0.2, 0], [0.2, 0.1], [-0.1, -0.35]].forEach(([ox, oy], i) => {
    const leaf = new THREE.Mesh(new THREE.EllipseCurve !== undefined
      ? new THREE.CircleGeometry(0.18 + i * 0.04, 5)
      : new THREE.CircleGeometry(0.2, 5),
      new THREE.MeshStandardMaterial({ color: 0x5A8050 + i * 0x080808, roughness: 0.9 })
    );
    leaf.rotation.y = Math.PI / 2;
    leaf.rotation.z = i * 0.7;
    leaf.position.set(-6.88, 5.5 + oy, -1.8 + ox);
    room.add(leaf);
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  MONSTERA PLANT — sculptural decorative plant in corner
  // ══════════════════════════════════════════════════════════════════════════

  function makeMonstera(px, pz) {
    const g = new THREE.Group();
    g.position.set(px, 0, pz);

    // Pot
    const potBody = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.55, 20), M.pot);
    potBody.position.y = 0.28; potBody.castShadow = true; g.add(potBody);
    const potRim = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.04, 8, 20), M.pot);
    potRim.rotation.x = Math.PI / 2; potRim.position.y = 0.56; g.add(potRim);
    const potSaucer = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.3, 0.06, 20), M.pot);
    potSaucer.position.y = 0.03; g.add(potSaucer);
    // Soil
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0x3A2A1A, roughness: 1 }));
    soil.position.y = 0.57; g.add(soil);

    // Stem + Leaves
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x4A6A40, roughness: 0.9 });
    const leafData = [
      { h: 1.1, tilt: 0.4, side: -1, size: 0.55, rot: 0.5 },
      { h: 1.4, tilt: 0.35, side: 1, size: 0.62, rot: -0.4 },
      { h: 1.7, tilt: 0.25, side: -1, size: 0.5, rot: 0.6 },
      { h: 1.9, tilt: 0.15, side: 0, size: 0.68, rot: 0.1 },
      { h: 2.1, tilt: 0.3, side: 1, size: 0.44, rot: -0.5 },
    ];

    leafData.forEach(({ h, tilt, side, size, rot }) => {
      // Petiole (stem to leaf)
      const petLen = 0.5;
      const petiole = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, petLen, 6), stemMat);
      petiole.position.set(side * 0.08, 0.58 + h, side * 0.08);
      petiole.rotation.z = side * tilt;
      g.add(petiole);
      // Leaf blade (heart-shaped via scaled ellipse)
      const leafMesh = new THREE.Mesh(new THREE.CircleGeometry(size, 7), M.leaf);
      const lx = Math.sin(rot) * size * 0.9;
      const lz = Math.cos(rot) * size * 0.9;
      leafMesh.position.set(side * (0.08 + lx), 0.58 + h + petLen * 0.6, side * 0.08 + lz);
      leafMesh.rotation.set(tilt * 0.5 - 0.2, rot, side * tilt * 0.5);
      leafMesh.castShadow = true;
      g.add(leafMesh);
    });

    sceneManager.scene.add(g);
    return g;
  }

  makeMonstera(-5.8, -7.0);
  makeMonstera(5.5, -7.5);  // small one near window

  // ══════════════════════════════════════════════════════════════════════════
  //  SMALL DECOR — stack of books on floor, stacked tray on desk, candle
  // ══════════════════════════════════════════════════════════════════════════

  // Stack of 3 books on floor (beside chair)
  [[0, 0], [0.04, 0], [0, 0.02]].forEach(([dx, dz], i) => {
    const bk = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.07, 0.42),
      new THREE.MeshStandardMaterial({ color: [0xD4A880, 0x8090A8, 0xC8A8B0][i], roughness: 0.8 }));
    bk.position.set(-3.5 + dx, 0.035 + i * 0.072, -0.3 + dz);
    bk.rotation.y = i === 1 ? 0.15 : 0;
    bk.castShadow = true;
    room.add(bk);
  });
  // Small round tray on side table
  const trayMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.28, 0.025, 24), M.woodLight);
  trayMesh.position.set(4.8, 1.575, -2.0);
  room.add(trayMesh);
  // Candle on tray
  const candleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.22, 16),
    new THREE.MeshStandardMaterial({ color: 0xFFF8F0, roughness: 0.95 }));
  candleBody.position.set(4.65, 1.71, -1.88);
  room.add(candleBody);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xFFCC44 }));
  flame.scale.set(1, 2.0, 1);
  flame.position.set(4.65, 1.845, -1.88);
  room.add(flame);
  // Candle glow
  const candleLight = new THREE.PointLight(0xFFAA33, 0.4, 1.5, 2.5);
  candleLight.position.set(4.65, 1.87, -1.88);
  room.add(candleLight);
  // Animate flame + candle glow
  let ft = 0;
  sceneManager.addUpdatable({
    update(d) {
      ft += d;
      flame.scale.set(1, 1.8 + Math.sin(ft * 12) * 0.3, 1);
      flame.position.y = 1.845 + Math.sin(ft * 9.3) * 0.004;
      candleLight.intensity = 0.4 + Math.sin(ft * 11) * 0.12;
    }
  });

  // Small glass vase on corner of desk
  const smallVasePoints = [
    new THREE.Vector2(0.06, 0), new THREE.Vector2(0.09, 0.08),
    new THREE.Vector2(0.11, 0.2), new THREE.Vector2(0.08, 0.32), new THREE.Vector2(0.05, 0.38)
  ];
  const smallVase = new THREE.Mesh(new THREE.LatheGeometry(smallVasePoints, 20),
    new THREE.MeshPhysicalMaterial({ color: 0xDDEEFF, transparent: true, opacity: 0.7, roughness: 0.05, transmission: 0.5 }));
  smallVase.position.set(3.0, 2.16, -3.2);
  room.add(smallVase);

  // ══════════════════════════════════════════════════════════════════════════
  //  DINING / STUDY CHAIRS — behind the desk (far side from camera)
  //  They face toward the camera (rotation.y = 0, looking at +Z)
  // ══════════════════════════════════════════════════════════════════════════

  function makeDiningChair(px, pz, rotY = 0) {
    const g = new THREE.Group();
    g.position.set(px, 0, pz);
    g.rotation.y = rotY;

    const seatMat = new THREE.MeshPhysicalMaterial({
      color: 0xC8A070, roughness: 0.6, metalness: 0.04, clearcoat: 0.2
    });
    const fabricMat = new THREE.MeshStandardMaterial({ color: 0xD4B8A0, roughness: 0.95 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x8A7A68, roughness: 0.4, metalness: 0.7 });

    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.07, 1.0), seatMat);
    seat.position.y = 1.05; seat.castShadow = true; g.add(seat);
    // Seat cushion
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.09, 0.9), fabricMat);
    cushion.position.y = 1.13; g.add(cushion);

    // Back slats (3 vertical slats — elegant style)
    for (let s = 0; s < 3; s++) {
      const ox = (s - 1) * 0.3;
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.75, 0.06), seatMat);
      slat.position.set(ox, 1.57, -0.46);
      slat.castShadow = true; g.add(slat);
    }
    // Back top rail
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.09, 0.08), seatMat);
    topRail.position.set(0, 1.98, -0.46); g.add(topRail);
    // Back bottom rail
    const botRail = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.07, 0.06), seatMat);
    botRail.position.set(0, 1.18, -0.46); g.add(botRail);

    // 4 tapered legs
    [[-0.46, -0.42], [0.46, -0.42], [-0.46, 0.42], [0.46, 0.42]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.018, 1.04, 10), metalMat);
      leg.position.set(x, 0.52, z);
      // slight outward taper
      leg.rotation.x = z > 0 ? 0.04 : -0.04;
      leg.rotation.z = x > 0 ? 0.04 : -0.04;
      leg.castShadow = true; g.add(leg);
    });
    // Cross stretchers (structural, detail)
    const stretcherMat = metalMat;
    const strH = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.025, 0.025), stretcherMat);
    strH.position.set(0, 0.45, 0); g.add(strH);
    const strV = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.82), stretcherMat);
    strV.position.set(0, 0.45, 0); g.add(strV);

    return g;
  }

  // Chair 1 — left of desk centre (faces camera = rotation.y = 0)
  const dChair1 = makeDiningChair(-1.5, -5.6, 0);
  room.add(dChair1);
  // Chair 2 — right of desk centre
  const dChair2 = makeDiningChair(1.5, -5.6, 0);
  room.add(dChair2);

  // ══════════════════════════════════════════════════════════════════════════
  //  BED — rotated 90°, headboard near LEFT WALL
  //  g.rotation.y = π/2 → local-Z → world-X, so length runs along X
  //  Bed world extents:  X: -5.2 .. -2.6   Z: 4.1 .. 6.9
  // ══════════════════════════════════════════════════════════════════════════

  (function makeBed() {
    const bedX = -3.9;  // group centre X
    const bedZ = 5.5;  // group centre Z
    const bedW = 2.8;  // local X axis (becomes Z in world after rotation)
    const bedL = 2.6;  // local Z axis (becomes -X in world after rotation)

    // After rotation.y = +π/2:
    //   local +Z  → world -X   (headboard toward left wall ✓)
    //   local +X  → world +Z
    // Headboard world X ≈ bedX - bedL/2 = -5.2  (left wall at -7, so safe)
    // Foot-rail world X  ≈ bedX + bedL/2 = -2.6
    // Bed width world Z  : bedZ ± bedW/2 = 4.1 .. 6.9

    const frameMat = new THREE.MeshPhysicalMaterial({
      color: 0x6B4226, roughness: 0.55, metalness: 0.04, clearcoat: 0.35
    });
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xF8F2EC, roughness: 0.9 });
    const sheetMat = new THREE.MeshStandardMaterial({ color: 0xFFFBF5, roughness: 0.92 });
    const duvetMat = new THREE.MeshStandardMaterial({ color: 0xE8D8CC, roughness: 0.95 });
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xFFFAF5, roughness: 0.92 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xC0A8C0, roughness: 0.95 });

    const g = new THREE.Group();
    g.position.set(bedX, 0, bedZ);
    g.rotation.y = Math.PI / 2;   // ← KEY: rotate bed 90°

    // ── Platform base ─────────────────────────────────────────────────
    const base = new THREE.Mesh(new THREE.BoxGeometry(bedW + 0.1, 0.28, bedL + 0.1), frameMat);
    base.position.y = 0.14; base.castShadow = true; g.add(base);

    // ── Legs ──────────────────────────────────────────────────────────
    [
      [-bedW / 2 + 0.18, -bedL / 2 + 0.18],
      [bedW / 2 - 0.18, -bedL / 2 + 0.18],
      [-bedW / 2 + 0.18, 0],
      [bedW / 2 - 0.18, 0],
      [-bedW / 2 + 0.18, bedL / 2 - 0.18],
      [bedW / 2 - 0.18, bedL / 2 - 0.18],
    ].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.08), frameMat);
      leg.position.set(x, 0.06, z); g.add(leg);
    });

    // ── Mattress ──────────────────────────────────────────────────────
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(bedW, 0.32, bedL), mattressMat);
    mattress.position.y = 0.44; mattress.castShadow = true; g.add(mattress);
    const pipingMat = new THREE.MeshStandardMaterial({ color: 0xE0D0C0, roughness: 0.8 });
    const piping = new THREE.Mesh(new THREE.BoxGeometry(bedW + 0.02, 0.04, bedL + 0.02), pipingMat);
    piping.position.y = 0.62; g.add(piping);

    // ── Sheet ─────────────────────────────────────────────────────────
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(bedW - 0.04, 0.03, bedL * 0.65), sheetMat);
    sheet.position.set(0, 0.635, bedL * 0.15); g.add(sheet);

    // ── Duvet ─────────────────────────────────────────────────────────
    const duvetFlat = new THREE.Mesh(new THREE.BoxGeometry(bedW - 0.1, 0.14, bedL * 0.55), duvetMat);
    duvetFlat.position.set(0, 0.71, -bedL * 0.2); g.add(duvetFlat);
    const duvetFold = new THREE.Mesh(new THREE.BoxGeometry(bedW - 0.12, 0.22, 0.42), duvetMat);
    duvetFold.position.set(0, 0.72, bedL * 0.13); g.add(duvetFold);
    for (let qi = -3; qi <= 3; qi++) {
      const qLine = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.145, bedL * 0.55),
        new THREE.MeshStandardMaterial({ color: 0xD8C8BC, roughness: 0.95 }));
      qLine.position.set(qi * 0.34, 0.712, -bedL * 0.2); g.add(qLine);
    }

    // ── Pillows ───────────────────────────────────────────────────────
    [-0.72, 0.72].forEach(px => {
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.18, 0.45), pillowMat);
      pillow.position.set(px, 0.72, -bedL / 2 + 0.28);
      pillow.castShadow = true; g.add(pillow);
      const pip = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.47), pipingMat);
      pip.position.set(px, 0.83, -bedL / 2 + 0.28); g.add(pip);
    });
    const accentPillow = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.42), accentMat);
    accentPillow.position.set(0, 0.82, -bedL / 2 + 0.32);
    accentPillow.rotation.y = 0.4; g.add(accentPillow);

    // ── Headboard (upholstered, tufted) at local -Z end ───────────────
    const hbFabricMat = new THREE.MeshStandardMaterial({ color: 0xE0D0C4, roughness: 0.92 });
    const hbOuter = new THREE.Mesh(new THREE.BoxGeometry(bedW + 0.2, 1.55, 0.14), frameMat);
    hbOuter.position.set(0, 1.42, -bedL / 2 - 0.07); g.add(hbOuter);
    const hbPanel = new THREE.Mesh(new THREE.BoxGeometry(bedW - 0.02, 1.35, 0.08), hbFabricMat);
    hbPanel.position.set(0, 1.42, -bedL / 2 - 0.01); g.add(hbPanel);
    for (let bx = -1; bx <= 1; bx++) {
      for (let by = 0; by <= 1; by++) {
        const button = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8),
          new THREE.MeshStandardMaterial({ color: 0xC8B8A8, roughness: 0.7 }));
        button.scale.z = 0.3;
        button.position.set(bx * 0.7, 1.1 + by * 0.52, -bedL / 2 + 0.02);
        g.add(button);
      }
    }
    [-bedW / 2 + 0.08, bedW / 2 - 0.08].forEach(hx => {
      const hleg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.68, 0.14), frameMat);
      hleg.position.set(hx, 0.34, -bedL / 2 - 0.07); g.add(hleg);
    });

    // ── Foot rail at local +Z end ──────────────────────────────────────
    const footRail = new THREE.Mesh(new THREE.BoxGeometry(bedW + 0.1, 0.55, 0.1), frameMat);
    footRail.position.set(0, 0.86, bedL / 2 + 0.05); g.add(footRail);
    const footRailCap = new THREE.Mesh(new THREE.BoxGeometry(bedW + 0.12, 0.06, 0.12), frameMat);
    footRailCap.position.set(0, 1.16, bedL / 2 + 0.05); g.add(footRailCap);

    // ── Throw blanket at foot ─────────────────────────────────────────
    const throwMat = new THREE.MeshStandardMaterial({ color: 0xC8B0A8, roughness: 0.97 });
    const throwBlank = new THREE.Mesh(new THREE.BoxGeometry(bedW * 0.7, 0.12, 0.7), throwMat);
    throwBlank.position.set(0, 0.9, bedL / 2 - 0.2); throwBlank.castShadow = true; g.add(throwBlank);

    room.add(g);

    // ── Nightstands — placed in WORLD coords after rotation ────────────
    // After rotation.y = +π/2:
    //   Headboard is toward world -X (left wall side) → world x ≈ bedX - bedL/2 = -5.2
    //   Width runs along world Z → bedZ ± bedW/2 = 4.1 .. 6.9
    // Nightstands sit on the Z edges, near the headboard
    const nsHeadX = bedX - bedL / 2 + 0.1;    // ≈ -5.1  (near headboard, world X)
    const nsData = [
      { nz: bedZ - bedW / 2 - 0.55 },   // Z ≈ 3.55 (one side)
      { nz: bedZ + bedW / 2 + 0.55 },   // Z ≈ 7.45 (other side)
    ];
    nsData.forEach(({ nz }, ni) => {
      const nsTop = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.52), frameMat);
      nsTop.position.set(nsHeadX, 0.78, nz);
      nsTop.castShadow = true; room.add(nsTop);
      const nsBody = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.58, 0.52), frameMat);
      nsBody.position.set(nsHeadX, 0.47, nz);
      nsBody.castShadow = true; room.add(nsBody);
      // Drawer detail (face in +X direction, toward room)
      const drawerLine = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.42),
        new THREE.MeshStandardMaterial({ color: 0x4A2E18, roughness: 0.5 }));
      drawerLine.position.set(nsHeadX + 0.30, 0.48, nz); room.add(drawerLine);
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8),
        new THREE.MeshStandardMaterial({ color: 0xC8A860, metalness: 0.8, roughness: 0.2 }));
      handle.rotation.z = Math.PI / 2;
      handle.position.set(nsHeadX + 0.31, 0.44, nz); room.add(handle);

      // Lamp on nightstand 1 (near-Z side)
      if (ni === 0) {
        const nsLampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.04, 14),
          new THREE.MeshStandardMaterial({ color: 0xC8A860, metalness: 0.6, roughness: 0.3 }));
        nsLampBase.position.set(nsHeadX, 0.82, nz);
        room.add(nsLampBase);
        const nsLampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.38, 8),
          new THREE.MeshStandardMaterial({ color: 0xC8A860, metalness: 0.6, roughness: 0.3 }));
        nsLampPole.position.set(nsHeadX, 1.01, nz); room.add(nsLampPole);
        const nsShade = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.28, 20, 1, true),
          new THREE.MeshStandardMaterial({
            color: 0xF5DFA8, roughness: 0.85, side: THREE.DoubleSide,
            transparent: true, opacity: 0.88
          }));
        nsShade.rotation.x = Math.PI;
        nsShade.position.set(nsHeadX, 1.22, nz); room.add(nsShade);
        const nsLight = new THREE.PointLight(0xFFD080, 0.65, 4, 2);
        nsLight.position.set(nsHeadX + 0.3, 1.1, nz); room.add(nsLight);
      }
    });
  })();

  // ══════════════════════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════════════════════
  //  LUXURY VANITY SUITE & WARDROBE
  // ══════════════════════════════════════════════════════════════════════════

  createVanitySuite(room);

  //  SCENE ASSEMBLY
  // ══════════════════════════════════════════════════════════════════════════

  sceneManager.scene.add(room);
  return room;
}
