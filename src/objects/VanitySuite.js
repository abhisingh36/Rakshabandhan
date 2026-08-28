import * as THREE from 'three';

/**
 * ═════════════════════════════════════════════════════════════════════════════
 *  HIGH-LEVEL LUXURY VANITY SUITE & COSMETICS
 *  Studio-grade procedural 3D modeling for Rakshabandhan Bedroom
 * ═════════════════════════════════════════════════════════════════════════════
 */

// ── Procedural Texture Helpers ────────────────────────────────────────────────

function createMarbleTexture(w = 512, h = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Base warm off-white
  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 0, w, h);

  // Soft subtle cloud patches
  for (let i = 0; i < 18; i++) {
    const cx = Math.random() * w;
    const cy = Math.random() * h;
    const rad = 60 + Math.random() * 120;
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, rad);
    grad.addColorStop(0, 'rgba(235, 226, 215, 0.45)');
    grad.addColorStop(0.6, 'rgba(242, 235, 228, 0.2)');
    grad.addColorStop(1, 'rgba(250, 247, 242, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Elegant golden/grey veins
  ctx.lineWidth = 1.6;
  for (let v = 0; v < 7; v++) {
    ctx.strokeStyle = v % 2 === 0 ? 'rgba(195, 170, 140, 0.42)' : 'rgba(180, 185, 195, 0.35)';
    ctx.beginPath();
    let x = Math.random() * w;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < h) {
      y += 15 + Math.random() * 25;
      x += (Math.random() - 0.48) * 35;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createMirrorReflectionTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Soft vertical interior gradient (warm ceiling light down to warm wood floor)
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.2, '#FFF5EA');
  grad.addColorStop(0.5, '#E8EFF5');
  grad.addColorStop(0.8, '#D8E2E8');
  grad.addColorStop(1, '#CBB8A2');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 512);

  // Soft blurred room highlights (window reflection glow)
  const winGrad = ctx.createRadialGradient(80, 200, 10, 80, 200, 140);
  winGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  winGrad.addColorStop(0.5, 'rgba(235, 245, 255, 0.4)');
  winGrad.addColorStop(1, 'rgba(235, 245, 255, 0)');
  ctx.fillStyle = winGrad;
  ctx.beginPath();
  ctx.arc(80, 200, 140, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// ── Shared Materials ──────────────────────────────────────────────────────────

function createVanityMaterials() {
  const marbleTex = createMarbleTexture();
  const mirrorTex = createMirrorReflectionTexture();

  return {
    // Marble top
    marble: new THREE.MeshPhysicalMaterial({
      map: marbleTex,
      roughness: 0.18,
      metalness: 0.05,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
    }),
    // Brushed champagne gold
    gold: new THREE.MeshStandardMaterial({
      color: 0xE2BA68,
      metalness: 0.9,
      roughness: 0.22,
    }),
    // Polished gold (shiny trim)
    goldShiny: new THREE.MeshStandardMaterial({
      color: 0xF3CD7A,
      metalness: 0.95,
      roughness: 0.12,
    }),
    // Rose gold
    roseGold: new THREE.MeshStandardMaterial({
      color: 0xDCA096,
      metalness: 0.88,
      roughness: 0.2,
    }),
    // Cream / Ivory fluted wood
    ivoryWood: new THREE.MeshStandardMaterial({
      color: 0xF7F1E8,
      roughness: 0.75,
      metalness: 0.02,
    }),
    // Dusty rose velvet
    velvetRose: new THREE.MeshStandardMaterial({
      color: 0xDFA5B0,
      roughness: 0.95,
      metalness: 0.04,
    }),
    // Deep berry / burgundy
    berryLip: new THREE.MeshPhysicalMaterial({
      color: 0xA81836,
      roughness: 0.35,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
    }),
    // High-clarity crystal glass
    crystalGlass: new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.04,
      ior: 1.52,
      thickness: 0.4,
    }),
    // Frosted cosmetic glass (serum / cream)
    frostedPinkGlass: new THREE.MeshPhysicalMaterial({
      color: 0xFDECEF,
      transmission: 0.78,
      opacity: 0.95,
      transparent: true,
      roughness: 0.25,
      ior: 1.45,
      thickness: 0.3,
    }),
    // Perfume liquid (amber rose)
    perfumeRoseLiquid: new THREE.MeshPhysicalMaterial({
      color: 0xE88898,
      transmission: 0.7,
      transparent: true,
      roughness: 0.05,
      ior: 1.35,
    }),
    // Perfume liquid (golden champagne)
    perfumeGoldLiquid: new THREE.MeshPhysicalMaterial({
      color: 0xE8B860,
      transmission: 0.7,
      transparent: true,
      roughness: 0.05,
      ior: 1.35,
    }),
    // Luxury mirror glass (luminous, silvered with interior reflection)
    mirrorGlass: new THREE.MeshPhysicalMaterial({
      map: mirrorTex,
      color: 0xF4F9FC,
      metalness: 0.4,
      roughness: 0.03,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.95,
    }),
    // LED halo strip (warm glow)
    ledGlow: new THREE.MeshStandardMaterial({
      color: 0xFFF5E8,
      emissive: 0xFFECD2,
      emissiveIntensity: 1.6,
      roughness: 0.3,
    }),
    // Ceramic matte ivory
    ceramicIvory: new THREE.MeshStandardMaterial({
      color: 0xFDFBF7,
      roughness: 0.65,
      metalness: 0.02,
    }),
    // Ceramic terracotta/sage
    ceramicSage: new THREE.MeshStandardMaterial({
      color: 0xA8BAA2,
      roughness: 0.75,
      metalness: 0.02,
    }),
    // Black lacquer
    blackLacquer: new THREE.MeshStandardMaterial({
      color: 0x1A1A1A,
      roughness: 0.15,
      metalness: 0.2,
    }),
    // Brush bristle dark base
    bristleDark: new THREE.MeshStandardMaterial({
      color: 0x332822,
      roughness: 0.9,
    }),
    // Brush bristle soft tip
    bristleTip: new THREE.MeshStandardMaterial({
      color: 0xF8E8DA,
      roughness: 0.95,
    }),
    // Pearl iridescent
    pearl: new THREE.MeshPhysicalMaterial({
      color: 0xFFFBF8,
      roughness: 0.15,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      metalness: 0.1,
    }),
  };
}

// ── 1. The Dressing Table (Vanity Desk) ────────────────────────────────────────

function buildVanityTable(room, M, VX, VTH, VZ) {
  const g = new THREE.Group();

  const TW = 1.70; // Table width along Z
  const TD = 0.64; // Table depth along X
  const TH = 0.06; // Tabletop slab thickness

  // ── Marble Slab (chamfered rounded rectangular top) ──────────────────────
  const top = new THREE.Mesh(new THREE.BoxGeometry(TD, TH, TW), M.marble);
  top.position.set(VX - TD / 2, VTH + TH / 2, VZ);
  top.castShadow = true;
  top.receiveShadow = true;
  g.add(top);

  // Gold perimeter lip/trim beneath the marble top
  const goldLip = new THREE.Mesh(new THREE.BoxGeometry(TD + 0.02, 0.018, TW + 0.02), M.gold);
  goldLip.position.set(VX - TD / 2, VTH - 0.009, VZ);
  g.add(goldLip);

  // ── Fluted / Tambour Apron Body ──────────────────────────────────────────
  const apronH = 0.26;
  const apronW = TW - 0.06;
  const apronD = TD - 0.06;

  const apron = new THREE.Mesh(new THREE.BoxGeometry(apronD, apronH, apronW), M.ivoryWood);
  apron.position.set(VX - TD / 2, VTH - apronH / 2 - 0.018, VZ);
  apron.castShadow = true;
  g.add(apron);

  // Fluted vertical ribs along the front face
  const numRibs = 38;
  for (let r = 0; r < numRibs; r++) {
    const rz = VZ - apronW / 2 + (r / (numRibs - 1)) * apronW;
    const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, apronH - 0.02, 8), M.ivoryWood);
    rib.position.set(VX - 0.025, VTH - apronH / 2 - 0.018, rz);
    g.add(rib);
  }

  // Rounded Semicircular End-Caps for the vanity (curved tambour ends)
  [-apronW / 2, apronW / 2].forEach(endZ => {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(apronD / 2, apronD / 2, apronH, 20, 1, false, 0, Math.PI), M.ivoryWood);
    cap.position.set(VX - TD / 2, VTH - apronH / 2 - 0.018, VZ + endZ);
    cap.rotation.y = endZ < 0 ? -Math.PI / 2 : Math.PI / 2;
    g.add(cap);
  });

  // ── Dual Drawers & Brushed Gold Bar Handles ─────────────────────────────
  [-0.38, 0.38].forEach(dOffset => {
    // Drawer seam frame
    const dFrame = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.16, 0.52), M.gold);
    dFrame.position.set(VX - 0.012, VTH - apronH / 2 - 0.018, VZ + dOffset);
    g.add(dFrame);

    // Minimalist cylindrical bar handle
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.22, 10), M.goldShiny);
    handle.rotation.x = Math.PI / 2;
    handle.position.set(VX + 0.025, VTH - apronH / 2 - 0.018, VZ + dOffset);
    g.add(handle);

    // Standoffs for handle
    [-0.08, 0.08].forEach(sOff => {
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.035, 8), M.goldShiny);
      stand.rotation.z = Math.PI / 2;
      stand.position.set(VX + 0.01, VTH - apronH / 2 - 0.018, VZ + dOffset + sOff);
      g.add(stand);
    });
  });

  // ── Splayed Tapered Brushed Gold Legs ────────────────────────────────────
  const legH = VTH - apronH - 0.018;
  const legPositions = [
    [VX - 0.10, VZ - TW / 2 + 0.15, -0.06, -0.06],
    [VX - 0.10, VZ + TW / 2 - 0.15, -0.06, 0.06],
    [VX - TD + 0.10, VZ - TW / 2 + 0.15, 0.06, -0.06],
    [VX - TD + 0.10, VZ + TW / 2 - 0.15, 0.06, 0.06],
  ];

  legPositions.forEach(([lx, lz, tiltX, tiltZ]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.010, legH, 12), M.gold);
    leg.position.set(lx, legH / 2, lz);
    leg.rotation.x = tiltZ;
    leg.rotation.z = tiltX;
    leg.castShadow = true;
    g.add(leg);

    // Brushed gold flared foot ferrule
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.06, 12), M.goldShiny);
    foot.position.set(lx, 0.03, lz);
    g.add(foot);
  });

  // Bottom gold reinforcement stretcher
  const stretch = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, TW - 0.4, 8), M.gold);
  stretch.position.set(VX - TD / 2, 0.28, VZ);
  g.add(stretch);

  room.add(g);
  return g;
}

// ── 2. The Arched LED Backlit Vanity Mirror ────────────────────────────────────

function buildArchVanityMirror(room, M, VX, VTH, VZ) {
  const g = new THREE.Group();

  const mirW = 0.95; // Mirror width (along Z)
  const mirH = 1.32; // Mirror height
  const mirY = VTH + mirH / 2 + 0.04;
  const mirX = 6.94; // Mounted flush against right wall (x=+7)

  // ── Mirror Outer Gold Arched Frame ───────────────────────────────────────
  const frameD = 0.045;
  const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(frameD, mirH + 0.06, mirW + 0.06), M.gold);
  frameMesh.position.set(mirX - frameD / 2, mirY, VZ);
  g.add(frameMesh);

  // Arched top curve of frame
  const archTop = new THREE.Mesh(new THREE.CylinderGeometry(mirW / 2 + 0.03, mirW / 2 + 0.03, frameD, 32, 1, false, 0, Math.PI), M.gold);
  archTop.rotation.z = Math.PI / 2;
  archTop.position.set(mirX - frameD / 2, mirY + mirH / 2 + 0.02, VZ);
  g.add(archTop);

  // ── Luminous Silvered Mirror Glass ───────────────────────────────────────
  const glassMesh = new THREE.Mesh(new THREE.PlaneGeometry(mirW, mirH), M.mirrorGlass);
  glassMesh.rotation.y = -Math.PI / 2;
  glassMesh.position.set(mirX - frameD - 0.005, mirY, VZ);
  g.add(glassMesh);

  const glassTop = new THREE.Mesh(new THREE.CircleGeometry(mirW / 2, 32, 0, Math.PI), M.mirrorGlass);
  glassTop.rotation.y = -Math.PI / 2;
  glassTop.position.set(mirX - frameD - 0.005, mirY + mirH / 2, VZ);
  g.add(glassTop);

  // ── Integrated LED Backlit Ring / Halo Channel ───────────────────────────
  // Frosted glowing strip framing the inner perimeter
  const haloStrip = new THREE.Mesh(new THREE.PlaneGeometry(mirW + 0.02, 0.03), M.ledGlow);
  haloStrip.rotation.y = -Math.PI / 2;
  haloStrip.position.set(mirX - frameD - 0.008, VTH + 0.05, VZ);
  g.add(haloStrip);

  const haloArch = new THREE.Mesh(new THREE.RingGeometry(mirW / 2 - 0.025, mirW / 2, 32, 1, 0, Math.PI), M.ledGlow);
  haloArch.rotation.y = -Math.PI / 2;
  haloArch.position.set(mirX - frameD - 0.008, mirY + mirH / 2, VZ);
  g.add(haloArch);

  // Warm ambient PointLight emanating from behind the mirror
  const mirrorLight = new THREE.PointLight(0xFFE8D0, 0.85, 3.8, 2);
  mirrorLight.position.set(mirX - 0.25, mirY + 0.2, VZ);
  g.add(mirrorLight);

  room.add(g);
  return g;
}

// ── 3. Pleated Velvet Luxury Ottoman / Stool ──────────────────────────────────

function buildPleatedStool(room, M, sX, sZ) {
  const g = new THREE.Group();

  const stoolH = 0.52;
  const radius = 0.34;

  // ── Heavy Brushed Gold Plinth Base Ring ──────────────────────────────────
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.06, 32), M.gold);
  plinth.position.set(sX, 0.03, sZ);
  plinth.castShadow = true;
  g.add(plinth);

  // ── Pleated Fluted Velvet Cylinder ───────────────────────────────────────
  const bodyH = stoolH - 0.12;
  const coreBody = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.96, radius * 0.96, bodyH, 32), M.velvetRose);
  coreBody.position.set(sX, 0.06 + bodyH / 2, sZ);
  coreBody.castShadow = true;
  g.add(coreBody);

  // 24 Pleated Vertical Channels (creates rich soft velvet shadows)
  const numPleats = 24;
  for (let p = 0; p < numPleats; p++) {
    const angle = (p / numPleats) * Math.PI * 2;
    const px = sX + Math.cos(angle) * (radius - 0.015);
    const pz = sZ + Math.sin(angle) * (radius - 0.015);

    const pleat = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, bodyH, 10), M.velvetRose);
    pleat.position.set(px, 0.06 + bodyH / 2, pz);
    g.add(pleat);
  }

  // ── Button-Tufted Plush Seat Cushion ─────────────────────────────────────
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(radius + 0.01, radius + 0.01, 0.08, 32), M.velvetRose);
  seat.position.set(sX, stoolH - 0.04, sZ);
  seat.castShadow = true;
  g.add(seat);

  // Rose gold piping seam around seat edge
  const piping = new THREE.Mesh(new THREE.TorusGeometry(radius + 0.012, 0.012, 8, 32), M.roseGold);
  piping.rotation.x = Math.PI / 2;
  piping.position.set(sX, stoolH - 0.01, sZ);
  g.add(piping);

  // Deep button tufts (6 radial + 1 center)
  for (let b = 0; b < 6; b++) {
    const angle = (b / 6) * Math.PI * 2;
    const bx = sX + Math.cos(angle) * 0.16;
    const bz = sZ + Math.sin(angle) * 0.16;

    const btn = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), M.roseGold);
    btn.scale.y = 0.35;
    btn.position.set(bx, stoolH, bz);
    g.add(btn);
  }
  const cBtn = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), M.roseGold);
  cBtn.scale.y = 0.35;
  cBtn.position.set(sX, stoolH, sZ);
  g.add(cBtn);

  room.add(g);
  return g;
}

// ── 4. High-Level 3D Cosmetics Collection ─────────────────────────────────────

function buildCosmeticsCollection(room, M, TX, TY, VZ) {
  const g = new THREE.Group();

  // ══════════════════════════════════════════════════════════════════════════
  //  (A) CARRARA MARBLE & GOLD PERFUME TRAY
  // ══════════════════════════════════════════════════════════════════════════

  const trayX = TX - 0.04;
  const trayZ = VZ - 0.44;
  const trayW = 0.54; // along Z
  const trayD = 0.28; // along X

  // Marble tray base
  const trayBase = new THREE.Mesh(new THREE.BoxGeometry(trayD, 0.018, trayW), M.marble);
  trayBase.position.set(trayX, TY + 0.009, trayZ);
  trayBase.castShadow = true;
  g.add(trayBase);

  // Brushed gold wire railing around tray perimeter
  const railH = 0.038;
  const railThick = 0.005;
  const railMat = M.goldShiny;

  // Railing top loop
  const railTop = new THREE.Mesh(new THREE.BoxGeometry(trayD + 0.01, railThick, trayW + 0.01), railMat);
  railTop.position.set(trayX, TY + railH, trayZ);
  g.add(railTop);

  // Railing corner & mid posts
  [
    [-trayD / 2, -trayW / 2], [trayD / 2, -trayW / 2],
    [-trayD / 2, trayW / 2], [trayD / 2, trayW / 2],
    [-trayD / 2, 0], [trayD / 2, 0]
  ].forEach(([dx, dz]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, railH, 8), railMat);
    post.position.set(trayX + dx, TY + railH / 2, trayZ + dz);
    g.add(post);
  });

  // ── Perfume 1: "DIOR/CHANEL" Luxe Crystal Flacon ──────────────────────────
  const p1X = trayX + 0.03;
  const p1Z = trayZ - 0.14;

  // Thick crystal glass flacon (heavy beveled base)
  const p1Glass = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.17, 0.09), M.crystalGlass);
  p1Glass.position.set(p1X, TY + 0.018 + 0.085, p1Z);
  p1Glass.castShadow = true;
  g.add(p1Glass);

  // Rose-gold juice core visible inside
  const p1Liquid = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.12, 0.065), M.perfumeRoseLiquid);
  p1Liquid.position.set(p1X, TY + 0.018 + 0.068, p1Z);
  g.add(p1Liquid);

  // Gold atomizer collar & nozzle
  const p1Collar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.03, 14), M.goldShiny);
  p1Collar.position.set(p1X, TY + 0.19, p1Z);
  g.add(p1Collar);

  // Petite metallic ribbon bow
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.005, 6, 16), M.goldShiny);
  bow.position.set(p1X - 0.012, TY + 0.19, p1Z);
  g.add(bow);

  // Faceted crystal octagonal stopper cap
  const p1Cap = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.045, 0.06), M.crystalGlass);
  p1Cap.position.set(p1X, TY + 0.225, p1Z);
  g.add(p1Cap);

  // Gold label plate on front
  const p1Label = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.045), M.goldShiny);
  p1Label.rotation.y = -Math.PI / 2;
  p1Label.position.set(p1X - 0.046, TY + 0.10, p1Z);
  g.add(p1Label);

  // ── Perfume 2: "CHANEL CHANCE" Round Disc Flacon ─────────────────────────
  const p2X = trayX - 0.02;
  const p2Z = trayZ + 0.02;

  // Round disc glass body
  const p2Glass = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.045, 28), M.crystalGlass);
  p2Glass.rotation.x = Math.PI / 2;
  p2Glass.position.set(p2X, TY + 0.018 + 0.065, p2Z);
  g.add(p2Glass);

  // Inner amber liquid disc
  const p2Liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.035, 24), M.perfumeGoldLiquid);
  p2Liquid.rotation.x = Math.PI / 2;
  p2Liquid.position.set(p2X, TY + 0.018 + 0.065, p2Z);
  g.add(p2Liquid);

  // Polished gold outer ring border
  const p2Ring = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.005, 8, 28), M.goldShiny);
  p2Ring.rotation.y = Math.PI / 2;
  p2Ring.position.set(p2X, TY + 0.018 + 0.065, p2Z);
  g.add(p2Ring);

  // Frosted acrylic square cap with gold collar
  const p2Collar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 12), M.goldShiny);
  p2Collar.position.set(p2X, TY + 0.142, p2Z);
  g.add(p2Collar);

  const p2Cap = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.032, 0.032), M.crystalGlass);
  p2Cap.position.set(p2X, TY + 0.165, p2Z);
  g.add(p2Cap);

  // ── Perfume 3: Tall Fluted French Perfume ─────────────────────────────────
  const p3X = trayX + 0.04;
  const p3Z = trayZ + 0.16;

  const p3Pts = [
    new THREE.Vector2(0, 0), new THREE.Vector2(0.036, 0),
    new THREE.Vector2(0.042, 0.02), new THREE.Vector2(0.038, 0.14),
    new THREE.Vector2(0.024, 0.18), new THREE.Vector2(0.016, 0.22),
  ];
  const p3Bottle = new THREE.Mesh(new THREE.LatheGeometry(p3Pts, 20), M.crystalGlass);
  p3Bottle.position.set(p3X, TY + 0.018, p3Z);
  g.add(p3Bottle);

  const p3Cap = new THREE.Mesh(new THREE.SphereGeometry(0.024, 14, 10), M.goldShiny);
  p3Cap.position.set(p3X, TY + 0.245, p3Z);
  g.add(p3Cap);

  // ── Draped Pearl Necklace on Tray ────────────────────────────────────────
  const pearlRadius = 0.0075;
  const numPearls = 18;
  for (let i = 0; i < numPearls; i++) {
    const t = i / (numPearls - 1);
    const px = trayX - 0.06 + Math.sin(t * Math.PI) * 0.10;
    const pz = trayZ - 0.18 + t * 0.32;
    const py = TY + 0.022 + Math.sin(t * Math.PI * 1.5) * 0.006;

    const prl = new THREE.Mesh(new THREE.SphereGeometry(pearlRadius, 8, 8), M.pearl);
    prl.position.set(px, py, pz);
    g.add(prl);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  (B) DESIGNER RIBBED MAKEUP BRUSH HOLDER & PRO BRUSHES
  // ══════════════════════════════════════════════════════════════════════════

  const potX = TX - 0.02;
  const potZ = VZ + 0.52;
  const potR = 0.072;
  const potH = 0.16;

  // Fluted ceramic pot
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(potR, potR * 0.92, potH, 24, 1, true), M.ceramicIvory);
  pot.position.set(potX, TY + potH / 2, potZ);
  pot.castShadow = true;
  g.add(pot);

  // Pot solid base
  const potBase = new THREE.Mesh(new THREE.CylinderGeometry(potR * 0.92, potR * 0.92, 0.015, 24), M.ceramicIvory);
  potBase.position.set(potX, TY + 0.008, potZ);
  g.add(potBase);

  // Polished gold top rim
  const potRim = new THREE.Mesh(new THREE.TorusGeometry(potR, 0.008, 8, 24), M.goldShiny);
  potRim.rotation.x = Math.PI / 2;
  potRim.position.set(potX, TY + potH, potZ);
  g.add(potRim);

  // Pearl beads filling at base inside cup
  const beadSurface = new THREE.Mesh(new THREE.CylinderGeometry(potR * 0.88, potR * 0.88, 0.01, 20), M.pearl);
  beadSurface.position.set(potX, TY + 0.06, potZ);
  g.add(beadSurface);

  // 6 Professional Makeup Brushes (spread at natural fanning angles)
  const brushSpecs = [
    { type: 'kabuki', angle: -0.15, tiltZ: 0.12, len: 0.23, fColor: M.roseGold, r: 0.022 },
    { type: 'contour', angle: 0.20, tiltZ: -0.14, len: 0.21, fColor: M.gold, r: 0.018 },
    { type: 'fan', angle: 0.05, tiltZ: 0.22, len: 0.24, fColor: M.roseGold, r: 0.028 },
    { type: 'blend', angle: -0.22, tiltZ: -0.08, len: 0.19, fColor: M.gold, r: 0.012 },
    { type: 'shadow', angle: 0.18, tiltZ: 0.10, len: 0.18, fColor: M.roseGold, r: 0.011 },
    { type: 'lip', angle: 0.0, tiltZ: -0.18, len: 0.17, fColor: M.gold, r: 0.009 },
  ];

  brushSpecs.forEach((b, bi) => {
    const a = (bi / brushSpecs.length) * Math.PI * 2;
    const bx = potX + Math.cos(a) * 0.035;
    const bz = potZ + Math.sin(a) * 0.035;

    // Handle (glossy ivory/black)
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.007, b.len * 0.65, 8), M.blackLacquer);
    handle.position.set(bx, TY + 0.06 + (b.len * 0.65) / 2, bz);
    handle.rotation.set(b.angle, 0, b.tiltZ);
    g.add(handle);

    // Rose gold ferrule collar
    const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.035, 10), b.fColor);
    ferrule.position.set(bx, TY + 0.06 + b.len * 0.65 + 0.015, bz);
    ferrule.rotation.set(b.angle, 0, b.tiltZ);
    g.add(ferrule);

    // Bristle head (two-tone: dark base + silky soft gradient tip)
    const bristleBase = new THREE.Mesh(new THREE.ConeGeometry(b.r, 0.045, 12), M.bristleDark);
    bristleBase.position.set(bx, TY + 0.06 + b.len * 0.65 + 0.045, bz);
    bristleBase.rotation.set(b.angle, 0, b.tiltZ);
    g.add(bristleBase);

    const bristleTip = new THREE.Mesh(new THREE.SphereGeometry(b.r * 0.85, 10, 8), M.bristleTip);
    bristleTip.position.set(bx, TY + 0.06 + b.len * 0.65 + 0.065, bz);
    g.add(bristleTip);
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  (C) OPEN LUXURY EYESHADOW PALETTE
  // ══════════════════════════════════════════════════════════════════════════

  const palX = TX + 0.02;
  const palZ = VZ - 0.04;
  const palW = 0.22;
  const palD = 0.14;

  // Base tray
  const palBase = new THREE.Mesh(new THREE.BoxGeometry(palD, 0.016, palW), M.roseGold);
  palBase.position.set(palX, TY + 0.008, palZ);
  palBase.castShadow = true;
  g.add(palBase);

  // Inner black insert
  const palInsert = new THREE.Mesh(new THREE.BoxGeometry(palD - 0.016, 0.008, palW - 0.016), M.blackLacquer);
  palInsert.position.set(palX, TY + 0.017, palZ);
  g.add(palInsert);

  // 9 Shimmering & Matte Color Pans
  const panColors = [
    0xE8C4B8, 0xD4A088, 0xC47888,
    0xD8B070, 0x8A4858, 0x583038,
    0xF0E0D0, 0xB890A0, 0x3A2028
  ];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const px = palX + (row - 1) * 0.034;
      const pz = palZ + (col - 1) * 0.058 - 0.015;

      const pan = new THREE.Mesh(
        new THREE.BoxGeometry(0.028, 0.006, 0.046),
        new THREE.MeshStandardMaterial({ color: panColors[idx], roughness: 0.45, metalness: 0.2 })
      );
      pan.position.set(px, TY + 0.021, pz);
      g.add(pan);
    }
  }

  // Open Lid (propped open at 55° with interior mirror)
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.012, palD, palW), M.roseGold);
  lid.rotation.z = -0.95;
  lid.position.set(palX + palD / 2 + 0.03, TY + 0.07, palZ);
  g.add(lid);

  const lidMirror = new THREE.Mesh(new THREE.PlaneGeometry(palW - 0.03, palD - 0.03), M.mirrorGlass);
  lidMirror.rotation.x = Math.PI / 2;
  lidMirror.rotation.y = -0.95;
  lidMirror.position.set(palX + palD / 2 + 0.022, TY + 0.07, palZ);
  g.add(lidMirror);

  // ══════════════════════════════════════════════════════════════════════════
  //  (D) LUXURY LIPSTICKS (1 OPEN BULLET + 2 CAPPED)
  // ══════════════════════════════════════════════════════════════════════════

  const lipX = TX - 0.08;
  const lipZ = VZ + 0.22;

  // ── 1. Open Lipstick with Sculpted Crimson Bullet ─────────────────────────
  // Outer square base
  const lip1Base = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.065, 0.032), M.blackLacquer);
  lip1Base.position.set(lipX, TY + 0.0325, lipZ);
  lip1Base.castShadow = true;
  g.add(lip1Base);

  // Gold waist band
  const lip1Band = new THREE.Mesh(new THREE.BoxGeometry(0.033, 0.012, 0.033), M.goldShiny);
  lip1Band.position.set(lipX, TY + 0.065, lipZ);
  g.add(lip1Band);

  // Inner shiny gold swivel cylinder
  const lip1Swivel = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.045, 16), M.goldShiny);
  lip1Swivel.position.set(lipX, TY + 0.085, lipZ);
  g.add(lip1Swivel);

  // Sculpted angled teardrop lipstick bullet
  const lip1Bullet = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 16), M.berryLip);
  lip1Bullet.rotation.z = 0.18;
  lip1Bullet.position.set(lipX - 0.003, TY + 0.12, lipZ);
  g.add(lip1Bullet);

  // Open Cap resting beside the tube
  const lip1Cap = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.075, 0.032), M.blackLacquer);
  lip1Cap.rotation.z = Math.PI / 2;
  lip1Cap.position.set(lipX - 0.055, TY + 0.016, lipZ);
  g.add(lip1Cap);

  // ── 2. Capped Rose-Gold Ribbed Lipstick ──────────────────────────────────
  const lip2 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.125, 16), M.roseGold);
  lip2.position.set(lipX + 0.045, TY + 0.0625, lipZ - 0.04);
  lip2.castShadow = true;
  g.add(lip2);

  // ── 3. Capped Obsidian & Gold Luxury Lipstick ────────────────────────────
  const lip3 = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.13, 0.032), M.blackLacquer);
  lip3.position.set(lipX + 0.045, TY + 0.065, lipZ + 0.04);
  lip3.castShadow = true;
  g.add(lip3);

  const lip3Ring = new THREE.Mesh(new THREE.BoxGeometry(0.033, 0.015, 0.033), M.goldShiny);
  lip3Ring.position.set(lipX + 0.045, TY + 0.065, lipZ + 0.04);
  g.add(lip3Ring);

  // ══════════════════════════════════════════════════════════════════════════
  //  (E) LUXURY SKINCARE CREAMS & DROPPERS
  // ══════════════════════════════════════════════════════════════════════════

  // ── Frosted Pink Face Cream Jar ──────────────────────────────────────────
  const jarX = TX + 0.05;
  const jarZ = VZ + 0.18;

  const jarBody = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.052, 0.065, 24), M.frostedPinkGlass);
  jarBody.position.set(jarX, TY + 0.0325, jarZ);
  jarBody.castShadow = true;
  g.add(jarBody);

  const jarLid = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.024, 24), M.roseGold);
  jarLid.position.set(jarX, TY + 0.075, jarZ);
  g.add(jarLid);

  // ── Glass Botanical Serum Dropper Bottle ─────────────────────────────────
  const srmX = TX + 0.06;
  const srmZ = VZ - 0.16;

  const srmBody = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.13, 20), M.crystalGlass);
  srmBody.position.set(srmX, TY + 0.065, srmZ);
  srmBody.castShadow = true;
  g.add(srmBody);

  const srmLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.09, 18), M.ceramicSage);
  srmLiquid.position.set(srmX, TY + 0.05, srmZ);
  g.add(srmLiquid);

  const srmCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.025, 14), M.goldShiny);
  srmCollar.position.set(srmX, TY + 0.14, srmZ);
  g.add(srmCollar);

  const srmBulb = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 10), M.blackLacquer);
  srmBulb.scale.y = 1.35;
  srmBulb.position.set(srmX, TY + 0.168, srmZ);
  g.add(srmBulb);

  // ── Open Cushion Compact Powder ──────────────────────────────────────────
  const cmpX = TX - 0.06;
  const cmpZ = VZ - 0.22;

  const cmpBase = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.016, 24), M.roseGold);
  cmpBase.position.set(cmpX, TY + 0.008, cmpZ);
  g.add(cmpBase);

  const cmpPowder = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.006, 24),
    new THREE.MeshStandardMaterial({ color: 0xF2DAC8, roughness: 0.95 }));
  cmpPowder.position.set(cmpX, TY + 0.018, cmpZ);
  g.add(cmpPowder);

  // Open lid with inner mirror
  const cmpLid = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.012, 24), M.roseGold);
  cmpLid.rotation.x = -1.1;
  cmpLid.position.set(cmpX, TY + 0.05, cmpZ - 0.055);
  g.add(cmpLid);

  const cmpMirror = new THREE.Mesh(new THREE.CircleGeometry(0.048, 24), M.mirrorGlass);
  cmpMirror.rotation.x = -1.1;
  cmpMirror.position.set(cmpX, TY + 0.05, cmpZ - 0.048);
  g.add(cmpMirror);

  // ══════════════════════════════════════════════════════════════════════════
  //  (F) APOTHECARY COTTON CANISTER & BEAUTY BLENDER SPONGE
  // ══════════════════════════════════════════════════════════════════════════

  const canX = TX + 0.08;
  const canZ = VZ + 0.36;

  // Clear glass cylinder
  const canister = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.11, 20, 1, true), M.crystalGlass);
  canister.position.set(canX, TY + 0.055, canZ);
  g.add(canister);

  // Stack of 6 white cotton pads visible inside
  for (let c = 0; c < 6; c++) {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.040, 0.012, 16),
      new THREE.MeshStandardMaterial({ color: 0xFFFAFA, roughness: 0.98 }));
    pad.position.set(canX, TY + 0.012 + c * 0.014, canZ);
    g.add(pad);
  }

  // Gold lid with mini sphere knob
  const canLid = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.012, 20), M.goldShiny);
  canLid.position.set(canX, TY + 0.115, canZ);
  g.add(canLid);

  const canKnob = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), M.goldShiny);
  canKnob.position.set(canX, TY + 0.128, canZ);
  g.add(canKnob);

  // Pink Teardrop Beauty Blender Sponge
  const bbX = canX - 0.065;
  const bbZ = canZ + 0.02;

  // Mini gold wire pedestal
  const bbRing = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.004, 6, 16), M.goldShiny);
  bbRing.rotation.x = Math.PI / 2;
  bbRing.position.set(bbX, TY + 0.016, bbZ);
  g.add(bbRing);

  // Teardrop sponge (scaled sphere)
  const sponge = new THREE.Mesh(new THREE.SphereGeometry(0.024, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xF27898, roughness: 0.88 }));
  sponge.scale.set(1, 1.45, 1);
  sponge.position.set(bbX, TY + 0.038, bbZ);
  g.add(sponge);

  // ══════════════════════════════════════════════════════════════════════════
  //  (G) VINTAGE ROSE-GOLD HAND MIRROR (Lying Elegantly)
  // ══════════════════════════════════════════════════════════════════════════

  const hmX = TX - 0.04;
  const hmZ = VZ - 0.62;

  const hmFrame = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.012, 10, 28), M.roseGold);
  hmFrame.rotation.x = Math.PI / 2;
  hmFrame.position.set(hmX, TY + 0.012, hmZ);
  g.add(hmFrame);

  const hmGlass = new THREE.Mesh(new THREE.CircleGeometry(0.068, 24), M.mirrorGlass);
  hmGlass.rotation.x = -Math.PI / 2;
  hmGlass.position.set(hmX, TY + 0.014, hmZ);
  g.add(hmGlass);

  const hmHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.014, 0.16, 10), M.roseGold);
  hmHandle.rotation.z = Math.PI / 2;
  hmHandle.rotation.y = 0.2;
  hmHandle.position.set(hmX - 0.11, TY + 0.012, hmZ + 0.02);
  g.add(hmHandle);

  // ══════════════════════════════════════════════════════════════════════════
  //  (H) NORDIC MINIMALIST GLOBE VANITY LAMP
  // ══════════════════════════════════════════════════════════════════════════

  const lampX = TX + 0.02;
  const lampZ = VZ + 0.68;

  // Brushed gold heavy cylinder base
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.03, 20), M.gold);
  lampBase.position.set(lampX, TY + 0.015, lampZ);
  lampBase.castShadow = true;
  g.add(lampBase);

  // Slender curved brass stem (curving inward over the desk)
  const lampCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(lampX, TY + 0.03, lampZ),
    new THREE.Vector3(lampX, TY + 0.28, lampZ),
    new THREE.Vector3(lampX - 0.06, TY + 0.42, lampZ - 0.05),
    new THREE.Vector3(lampX - 0.12, TY + 0.46, lampZ - 0.08),
  ]);
  const stem = new THREE.Mesh(new THREE.TubeGeometry(lampCurve, 20, 0.009, 8, false), M.goldShiny);
  g.add(stem);

  // Frosted Glowing Opal Glass Sphere
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 24, 20),
    new THREE.MeshStandardMaterial({
      color: 0xFFFBF0,
      emissive: 0xFFEAC5,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    })
  );
  globe.position.set(lampX - 0.12, TY + 0.46, lampZ - 0.08);
  g.add(globe);

  // Warm soft light casting onto vanity table
  const lampLight = new THREE.PointLight(0xFFE5B8, 0.9, 3.2, 1.8);
  lampLight.position.set(lampX - 0.15, TY + 0.48, lampZ - 0.08);
  g.add(lampLight);

  // ══════════════════════════════════════════════════════════════════════════
  //  (I) FRESH PEONY & EUCALYPTUS FLORAL VASE
  // ══════════════════════════════════════════════════════════════════════════

  const vaseX = TX + 0.04;
  const vaseZ = VZ - 0.68;

  // Sculptural ribbed ceramic vase in terracotta/sage
  const vasePts = [
    new THREE.Vector2(0, 0), new THREE.Vector2(0.045, 0),
    new THREE.Vector2(0.058, 0.05), new THREE.Vector2(0.062, 0.14),
    new THREE.Vector2(0.040, 0.22), new THREE.Vector2(0.048, 0.28),
  ];
  const vase = new THREE.Mesh(new THREE.LatheGeometry(vasePts, 20), M.ceramicSage);
  vase.position.set(vaseX, TY, vaseZ);
  vase.castShadow = true;
  g.add(vase);

  // Blooming peony flower (layered soft curved petals)
  const peonyMat = new THREE.MeshStandardMaterial({ color: 0xF288A0, roughness: 0.88 });
  const peonyCenter = new THREE.MeshStandardMaterial({ color: 0xFFD880, roughness: 0.95 });

  const stemMat = new THREE.MeshStandardMaterial({ color: 0x4E7A4A, roughness: 0.9 });
  const eucaMat = new THREE.MeshStandardMaterial({ color: 0x7E9A88, roughness: 0.85, side: THREE.DoubleSide });

  // Main flower stems
  [[-0.015, 0.01, 0.36], [0.018, -0.012, 0.32], [0, 0.02, 0.38]].forEach(([sx, sz, sH]) => {
    const fStem = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.005, sH, 6), stemMat);
    fStem.position.set(vaseX + sx, TY + 0.15 + sH / 2, vaseZ + sz);
    g.add(fStem);

    const fY = TY + 0.15 + sH;
    // Layered petals for full peony bloom
    for (let l = 0; l < 8; l++) {
      const ang = (l / 8) * Math.PI * 2;
      const pet = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), peonyMat);
      pet.scale.set(1.2, 0.5, 1.2);
      pet.position.set(vaseX + sx + Math.cos(ang) * 0.02, fY, vaseZ + sz + Math.sin(ang) * 0.02);
      g.add(pet);
    }
    // Flower center core
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), peonyCenter);
    core.position.set(vaseX + sx, fY + 0.008, vaseZ + sz);
    g.add(core);

    // Eucalyptus leaves on stem
    for (let e = 0; e < 3; e++) {
      const eLeaf = new THREE.Mesh(new THREE.CircleGeometry(0.022, 10), eucaMat);
      eLeaf.rotation.x = 0.4 + e * 0.3;
      eLeaf.rotation.y = e * 1.8;
      eLeaf.position.set(vaseX + sx + (e % 2 === 0 ? 0.025 : -0.025), TY + 0.22 + e * 0.06, vaseZ + sz);
      g.add(eLeaf);
    }
  });

  room.add(g);
  return g;
}

// ── 5. French Arched Full-Length Floor Mirror ──────────────────────────────────

function buildFullLengthFloorMirror(room, M, mX, mZ) {
  const g = new THREE.Group();

  const mW = 0.88;
  const mH = 2.12;

  // ── Champagne Gold Arched Frame ──────────────────────────────────────────
  const frD = 0.06;
  const frame = new THREE.Mesh(new THREE.BoxGeometry(frD, mH, mW + 0.08), M.gold);
  frame.position.set(mX, mH / 2, mZ);
  frame.castShadow = true;
  g.add(frame);

  const archTop = new THREE.Mesh(new THREE.CylinderGeometry(mW / 2 + 0.04, mW / 2 + 0.04, frD, 32, 1, false, 0, Math.PI), M.gold);
  archTop.rotation.z = Math.PI / 2;
  archTop.position.set(mX, mH, mZ);
  g.add(archTop);

  // ── High-Reflection Mirror Glass ─────────────────────────────────────────
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(mW, mH - 0.04), M.mirrorGlass);
  glass.rotation.y = -Math.PI / 2;
  glass.position.set(mX - frD / 2 - 0.005, mH / 2, mZ);
  g.add(glass);

  const glassTop = new THREE.Mesh(new THREE.CircleGeometry(mW / 2, 32, 0, Math.PI), M.mirrorGlass);
  glassTop.rotation.y = -Math.PI / 2;
  glassTop.position.set(mX - frD / 2 - 0.005, mH - 0.02, mZ);
  g.add(glassTop);

  // ── Elegant Floor Feet / Base ────────────────────────────────────────────
  [-mW / 2 + 0.08, mW / 2 - 0.08].forEach(oz => {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.045, 0.08), M.goldShiny);
    foot.position.set(mX, 0.0225, mZ + oz);
    g.add(foot);
  });

  room.add(g);
  return g;
}

// ── 6. Gallery Wall Art (Framed Posters beside/above Vanity) ───────────────────

function buildVanityWallArt(room, M, wallX, VZ) {
  const g = new THREE.Group();

  const artSpecs = [
    { z: VZ - 0.72, y: 4.6, w: 0.55, h: 0.72, bg: '#FDF7F2', artCol: 0xD49488 },
    { z: VZ + 0.72, y: 4.6, w: 0.55, h: 0.72, bg: '#F5F8F5', artCol: 0x8A9E88 },
  ];

  artSpecs.forEach(art => {
    // Thin champagne gold frame
    const frm = new THREE.Mesh(new THREE.BoxGeometry(0.025, art.h + 0.04, art.w + 0.04), M.gold);
    frm.position.set(wallX - 0.02, art.y, art.z);
    g.add(frm);

    // Canvas poster with line art
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = art.bg;
    ctx.fillRect(0, 0, 256, 360);

    // Passe-partout inner border
    ctx.strokeStyle = '#E8E0D5';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, 208, 312);

    // Minimalist continuous line art
    ctx.strokeStyle = art.bg === '#FDF7F2' ? '#8A5850' : '#486850';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(128, 140, 50, 0, Math.PI * 2);
    ctx.moveTo(128, 190);
    ctx.bezierCurveTo(90, 250, 166, 280, 128, 310);
    ctx.stroke();

    const posterTex = new THREE.CanvasTexture(canvas);
    const posterMat = new THREE.MeshStandardMaterial({ map: posterTex, roughness: 0.9 });

    const poster = new THREE.Mesh(new THREE.PlaneGeometry(art.w, art.h), posterMat);
    poster.rotation.y = -Math.PI / 2;
    poster.position.set(wallX - 0.035, art.y, art.z);
    g.add(poster);
  });

  room.add(g);
  return g;
}

// ── 7. Luxury Parisian Built-in Wardrobe / Armoire (Left Wall) ─────────────────

function buildLuxuryWardrobe(room, M) {
  const g = new THREE.Group();

  const wX = -6.65; // Left wall (x=-7)
  const wZ = 0.9;   // Between armchair and nightstand
  const wW = 2.4;   // Width along Z
  const wH = 5.2;   // Height in Y
  const wD = 0.68;  // Depth in X

  // Main cabinet body
  const body = new THREE.Mesh(new THREE.BoxGeometry(wD, wH, wW), M.ivoryWood);
  body.position.set(wX + wD / 2, wH / 2, wZ);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // Decorative Parisian Crown Molding at top
  const crown = new THREE.Mesh(new THREE.BoxGeometry(wD + 0.08, 0.16, wW + 0.12), M.ivoryWood);
  crown.position.set(wX + wD / 2, wH + 0.08, wZ);
  g.add(crown);

  const crownGold = new THREE.Mesh(new THREE.BoxGeometry(wD + 0.09, 0.02, wW + 0.13), M.gold);
  crownGold.position.set(wX + wD / 2, wH + 0.16, wZ);
  g.add(crownGold);

  // 4 Door Panels with Classic Beveled Molding
  const numDoors = 4;
  const doorW = wW / numDoors;
  for (let d = 0; d < numDoors; d++) {
    const dz = wZ - wW / 2 + doorW / 2 + d * doorW;

    // Door seam line
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.015, wH - 0.2, 0.01), M.gold);
    seam.position.set(wX + wD + 0.005, wH / 2, dz + doorW / 2);
    g.add(seam);

    // Upper panel molding
    const pUpper = new THREE.Mesh(new THREE.BoxGeometry(0.02, 2.6, doorW - 0.08), M.ivoryWood);
    pUpper.position.set(wX + wD + 0.01, wH * 0.65, dz);
    g.add(pUpper);

    // Lower panel molding
    const pLower = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.4, doorW - 0.08), M.ivoryWood);
    pLower.position.set(wX + wD + 0.01, wH * 0.22, dz);
    g.add(pLower);

    // Long brushed brass vertical handle
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.65, 10), M.goldShiny);
    handle.position.set(wX + wD + 0.035, wH * 0.48, dz + (d % 2 === 0 ? doorW * 0.35 : -doorW * 0.35));
    g.add(handle);
  }

  room.add(g);
  return g;
}

// ── Main Suite Assembly Function ──────────────────────────────────────────────

export function createVanitySuite(room) {
  const M = createVanityMaterials();

  // Right Wall Anchor: x = +7 (facing -X into room), Window is at z = 0
  const VX = 6.25;  // Front edge of vanity table
  const VTH = 1.62; // Tabletop height
  const VZ = 4.0;   // Center Z of vanity (sunlit area beside window)

  // 1. Luxury Vanity Desk
  buildVanityTable(room, M, VX, VTH, VZ);

  // 2. Arched LED Backlit Vanity Mirror
  buildArchVanityMirror(room, M, VX, VTH, VZ);

  // 3. Pleated Velvet Luxury Ottoman / Stool
  buildPleatedStool(room, M, VX - 1.15, VZ);

  // 4. High-Level 3D Cosmetics Collection
  const TX = VX - 0.32; // Center X of tabletop items
  const TY = VTH + 0.06; // Surface level of table
  buildCosmeticsCollection(room, M, TX, TY, VZ);

  // 5. French Arched Full-Length Floor Mirror (between window and vanity)
  buildFullLengthFloorMirror(room, M, 6.72, 2.3);

  // 6. Wall Gallery Art above vanity
  buildVanityWallArt(room, M, 6.96, VZ);

  // 7. Parisian Built-in Wardrobe (on left wall)
  buildLuxuryWardrobe(room, M);
}
