import * as THREE from 'three';
import { sceneManager } from '../scene/SceneManager.js';

/**
 * Creates a premium warm cozy room environment.
 * Style: soft daylight, warm wood + cream walls, feminine accents.
 */
export function createRoomEnvironment() {
  const room = new THREE.Group();

  // ── Materials ─────────────────────────────────────────────────────────────
  const M = {
    // Cream/ivory walls
    wall: new THREE.MeshStandardMaterial({ color: 0xFAF3EA, roughness: 0.85, metalness: 0 }),
    // Warm feature wall (back, slight lavender blush)
    wallBack: new THREE.MeshStandardMaterial({ color: 0xEDE5F0, roughness: 0.9, metalness: 0 }),
    // Warm wooden floor planks
    floor: new THREE.MeshStandardMaterial({ color: 0xC9A882, roughness: 0.55, metalness: 0.04 }),
    // White ceiling
    ceiling: new THREE.MeshStandardMaterial({ color: 0xFFFCF8, roughness: 1, metalness: 0 }),
    // Walnut wood for desk/furniture
    wood: new THREE.MeshStandardMaterial({ color: 0x7B5230, roughness: 0.65, metalness: 0.05 }),
    // Light wood (shelves/chair)
    woodLight: new THREE.MeshStandardMaterial({ color: 0xC8A070, roughness: 0.7, metalness: 0.02 }),
    // Cream fabric (sofa/cushions)
    fabric: new THREE.MeshStandardMaterial({ color: 0xF0E2D0, roughness: 0.95, metalness: 0 }),
    // Dusty rose rug
    rug: new THREE.MeshStandardMaterial({ color: 0xE8BFBC, roughness: 1, metalness: 0 }),
    // Cream curtain
    curtain: new THREE.MeshStandardMaterial({
      color: 0xFAF0E0, roughness: 0.95, metalness: 0,
      side: THREE.DoubleSide
    }),
    // Window glass (frosted)
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xEEF5FF, roughness: 0.05, metalness: 0,
      transmission: 0.75, transparent: true, opacity: 0.6,
      ior: 1.45, thickness: 0.2
    }),
    // Skirting boards
    skirting: new THREE.MeshStandardMaterial({ color: 0xEDE0CE, roughness: 0.8, metalness: 0 }),
    // Warm emissive fairy light
    fairy: new THREE.MeshBasicMaterial({ color: 0xFFE8A0 }),
    // Book spines (array of colors)
    books: [
      new THREE.MeshStandardMaterial({ color: 0xD4887A, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0x8BA888, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0xB0A0D0, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0xE8C870, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0xA0B8D0, roughness: 0.7 }),
    ],
    // Cushion accent colors
    cushion1: new THREE.MeshStandardMaterial({ color: 0xC4A0C0, roughness: 0.95 }),
    cushion2: new THREE.MeshStandardMaterial({ color: 0x90B090, roughness: 0.95 }),
  };

  const RW = 14, RH = 9, RD = 14; // room width, height, depth

  // ── Floor ─────────────────────────────────────────────────────────────────
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), M.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  room.add(floor);

  // Floor plank lines (thin dark strips for planks)
  const plankMat = new THREE.MeshStandardMaterial({ color: 0x9A7550, roughness: 0.8 });
  for (let z = -RD / 2; z < RD / 2; z += 0.8) {
    const plank = new THREE.Mesh(new THREE.PlaneGeometry(RW, 0.025), plankMat);
    plank.rotation.x = -Math.PI / 2;
    plank.position.set(0, 0.001, z);
    room.add(plank);
  }

  // ── Ceiling ───────────────────────────────────────────────────────────────
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), M.ceiling);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = RH;
  room.add(ceiling);

  // ── Walls ─────────────────────────────────────────────────────────────────
  // Back wall (feature wall — lavender blush)
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), M.wallBack);
  backWall.position.set(0, RH / 2, -RD / 2);
  backWall.receiveShadow = true;
  room.add(backWall);

  // Left wall
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), M.wall);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-RW / 2, RH / 2, 0);
  leftWall.receiveShadow = true;
  room.add(leftWall);

  // Right wall (with window cut-out using separate panels)
  const winY = 3.5, winH = 3.5, winW = 4;
  const rightWallPanels = [
    // Above window
    { w: RW, h: RH - winY - winH, pos: [0, RH - (RH - winY - winH) / 2, 0] },
    // Below window
    { w: RW, h: winY, pos: [0, winY / 2, 0] },
    // Left of window
    { w: (RD - winW) / 2, h: winH, pos: [-(winW / 2 + (RD - winW) / 4), winY + winH / 2, 0] },
    // Right of window
    { w: (RD - winW) / 2, h: winH, pos: [(winW / 2 + (RD - winW) / 4), winY + winH / 2, 0] },
  ];
  rightWallPanels.forEach(({ w, h, pos }) => {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.wall);
    panel.rotation.y = -Math.PI / 2;
    panel.position.set(RW / 2, pos[1], pos[2]);
    panel.receiveShadow = true;
    room.add(panel);
  });

  // Window glass + frame
  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), M.glass);
  winGlass.rotation.y = -Math.PI / 2;
  winGlass.position.set(RW / 2 - 0.05, winY + winH / 2, 0);
  room.add(winGlass);

  // Window cross (frame divider)
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xF0E0C8, roughness: 0.6 });
  const winFrameH = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.3, 0.08, 0.12), frameMat);
  winFrameH.position.set(RW / 2 - 0.05, winY + winH / 2, 0);
  room.add(winFrameH);
  const winFrameV = new THREE.Mesh(new THREE.BoxGeometry(0.08, winH + 0.3, 0.12), frameMat);
  winFrameV.position.set(RW / 2 - 0.05, winY + winH / 2, 0);
  room.add(winFrameV);
  // Mid dividers
  const winMidH = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.06, 0.1), frameMat);
  winMidH.position.set(RW / 2 - 0.05, winY + winH / 2, 0);
  room.add(winMidH);
  const winMidV = new THREE.Mesh(new THREE.BoxGeometry(0.06, winH, 0.1), frameMat);
  winMidV.position.set(RW / 2 - 0.05, winY + winH / 2, 0);
  room.add(winMidV);

  // Window glow plane (simulates daylight coming through)
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xFFF8E8, transparent: true, opacity: 0.25, side: THREE.FrontSide
  });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(winW - 0.1, winH - 0.1), glowMat);
  glow.rotation.y = -Math.PI / 2;
  glow.position.set(RW / 2 - 0.1, winY + winH / 2, 0);
  room.add(glow);

  // ── Skirting boards ───────────────────────────────────────────────────────
  const skirtH = 0.18;
  [
    { geom: [RW, skirtH, 0.05], pos: [0, skirtH / 2, -RD / 2 + 0.025] },
    { geom: [RD, skirtH, 0.05], pos: [-RW / 2 + 0.025, skirtH / 2, 0], rotY: Math.PI / 2 },
    { geom: [RD, skirtH, 0.05], pos: [RW / 2 - 0.025, skirtH / 2, 0], rotY: Math.PI / 2 },
  ].forEach(({ geom, pos, rotY = 0 }) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(...geom), M.skirting);
    s.position.set(...pos);
    s.rotation.y = rotY;
    room.add(s);
  });

  // ── Oval Rug under desk ───────────────────────────────────────────────────
  const rugGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.04, 48);
  const rug = new THREE.Mesh(rugGeo, M.rug);
  rug.position.set(-0.5, 0.02, -2.5);
  rug.scale.set(1, 0.1, 0.65);
  rug.receiveShadow = true;
  room.add(rug);
  // Subtle border stripe on rug
  const rugBorderMat = new THREE.MeshStandardMaterial({ color: 0xD4A898, roughness: 1 });
  const rugBorder = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.041, 48, 1, true), rugBorderMat);
  rugBorder.position.copy(rug.position);
  rugBorder.scale.copy(rug.scale);
  room.add(rugBorder);

  // ── Desk (warm walnut, rounded) ───────────────────────────────────────────
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 2.0), M.wood);
  deskTop.position.set(0, 2.12, -4.2);
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  room.add(deskTop);

  // Desk front face edge (darker strip)
  const deskEdge = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 0.06), M.wood);
  deskEdge.position.set(0, 2.06, -3.25);
  room.add(deskEdge);

  // Desk legs (tapered elegant style)
  [[-2.0, -4.6], [2.0, -4.6], [-2.0, -3.8], [2.0, -3.8]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 2.0, 12), M.wood);
    leg.position.set(x, 1.0, z);
    leg.castShadow = true;
    room.add(leg);
  });

  // ── Small Side Table (round top, right of desk) ───────────────────────────
  const sideTabTop = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 32), M.woodLight);
  sideTabTop.position.set(3.5, 1.5, -2.0);
  sideTabTop.castShadow = true;
  room.add(sideTabTop);
  const sideTabLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 1.44, 12), M.woodLight);
  sideTabLeg.position.set(3.5, 0.75, -2.0);
  sideTabLeg.castShadow = true;
  room.add(sideTabLeg);
  // Tripod base feet
  [0, 120, 240].forEach(deg => {
    const rad = (deg * Math.PI) / 180;
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), M.woodLight);
    foot.rotation.z = Math.PI / 5;
    foot.position.set(
      3.5 + Math.sin(rad) * 0.35,
      0.12,
      -2.0 + Math.cos(rad) * 0.35
    );
    room.add(foot);
  });

  // ── Small Cozy Armchair (left of room) ────────────────────────────────────
  function makeChair(px, pz) {
    const g = new THREE.Group();
    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 1.2), M.fabric);
    seat.position.y = 0.52;
    seat.castShadow = true;
    g.add(seat);
    // Back
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 0.22), M.fabric);
    back.position.set(0, 1.12, -0.49);
    back.castShadow = true;
    g.add(back);
    // Arms
    [-0.65, 0.65].forEach(x => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.55, 1.2), M.fabric);
      arm.position.set(x, 0.77, 0);
      arm.castShadow = true;
      g.add(arm);
    });
    // Legs
    [[-0.55, -0.45], [0.55, -0.45], [-0.55, 0.45], [0.55, 0.45]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), M.wood);
      leg.position.set(x, 0.2, z);
      g.add(leg);
    });
    g.position.set(px, 0, pz);
    return g;
  }
  const chair = makeChair(-4.5, -1.5);
  chair.rotation.y = Math.PI / 8;
  room.add(chair);

  // Chair cushion
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 0.95), M.cushion1);
  cushion.position.set(-4.5, 0.72, -1.5);
  room.add(cushion);

  // ── Bookshelf (on left wall) ──────────────────────────────────────────────
  const shelfBase = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4.5, 2.5), M.woodLight);
  shelfBase.position.set(-6.9, 2.25, -4.5);
  shelfBase.castShadow = true;
  room.add(shelfBase);

  [1.2, 2.2, 3.2, 4.2].forEach(y => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 2.4), M.woodLight);
    shelf.position.set(-6.88, y, -4.5);
    shelf.castShadow = true;
    room.add(shelf);
  });

  // Books on shelves
  let bookX = -4.7;
  const bookColors = [0xD4887A, 0x8BA888, 0xB0A0D0, 0xE8C870, 0xA0B8D0, 0xC4A0A0, 0x90B090];
  [1.35, 2.35, 3.35].forEach(shelfY => {
    bookX = -4.55;
    for (let b = 0; b < 6; b++) {
      const bW = 0.12 + Math.random() * 0.06;
      const bH = 0.35 + Math.random() * 0.2;
      const bMat = new THREE.MeshStandardMaterial({
        color: bookColors[b % bookColors.length], roughness: 0.8
      });
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.1, bH, bW), bMat);
      book.position.set(-6.82, shelfY + bH / 2 + 0.03, bookX);
      bookX += bW + 0.02;
      room.add(book);
    }
  });

  // ── Curtain panels (either side of window) ───────────────────────────────
  function makeCurtain(pz) {
    const seg = 6;
    for (let i = 0; i < seg; i++) {
      const w = 0.22;
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, RH - 0.5), M.curtain);
      panel.rotation.y = Math.PI / 2;
      const offset = (i - seg / 2) * w * 0.9;
      const wave = Math.sin((i / seg) * Math.PI) * 0.15;
      panel.position.set(RW / 2 - 0.15, (RH - 0.5) / 2 + 0.25, pz + offset);
      panel.position.z += wave;
      room.add(panel);
    }
  }
  makeCurtain(-winW / 2 - 0.7);
  makeCurtain(winW / 2 + 0.7);

  // ── Ceiling molding strip ─────────────────────────────────────────────────
  const moldMat = new THREE.MeshStandardMaterial({ color: 0xF0E8D8, roughness: 0.8 });
  [
    [RW, 0.12, 0.12, 0, RH - 0.06, -RD / 2 + 0.06],
    [0.12, 0.12, RD, -RW / 2 + 0.06, RH - 0.06, 0],
    [0.12, 0.12, RD, RW / 2 - 0.06, RH - 0.06, 0],
  ].forEach(([w, h, d, x, y, z]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), moldMat);
    m.position.set(x, y, z);
    room.add(m);
  });

  // ── Fairy lights (hanging from ceiling) ──────────────────────────────────
  const fairyCount = 20;
  for (let i = 0; i < fairyCount; i++) {
    const x = (Math.random() - 0.5) * 8;
    const z = -2 - Math.random() * 5;
    const dropY = RH - 0.3 - Math.random() * 1.5;

    // String
    const stringGeo = new THREE.CylinderGeometry(0.004, 0.004, RH - dropY, 4);
    const stringMat = new THREE.MeshBasicMaterial({ color: 0xC8A870, transparent: true, opacity: 0.4 });
    const string = new THREE.Mesh(stringGeo, stringMat);
    string.position.set(x, dropY + (RH - dropY) / 2, z);
    room.add(string);

    // Bulb
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), M.fairy);
    bulb.position.set(x, dropY, z);
    room.add(bulb);
  }

  // ── Small decorative lamp on side table ──────────────────────────────────
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.06, 16), M.wood);
  lampBase.position.set(3.5, 1.56, -2.0);
  room.add(lampBase);
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 12), M.wood);
  lampPole.position.set(3.5, 1.91, -2.0);
  room.add(lampPole);
  // Shade
  const shadeGeo = new THREE.ConeGeometry(0.3, 0.35, 20, 1, true);
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xF5E0C0, roughness: 0.9, side: THREE.DoubleSide,
    transparent: true, opacity: 0.9
  });
  const shade = new THREE.Mesh(shadeGeo, shadeMat);
  shade.position.set(3.5, 2.42, -2.0);
  shade.rotation.x = Math.PI;
  shade.castShadow = false;
  room.add(shade);
  // Lamp glow
  const lampGlow = new THREE.PointLight(0xFFE8B0, 0.8, 4);
  lampGlow.position.set(3.5, 2.26, -2.0);
  room.add(lampGlow);

  // ── Wall art (simple decorative frame on back wall) ───────────────────────
  const artFrameMat = new THREE.MeshStandardMaterial({ color: 0xD4A76A, metalness: 0.5, roughness: 0.4 });
  const artFrame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6, 0.06), artFrameMat);
  artFrame.position.set(-2.5, 5.5, -6.98);
  room.add(artFrame);
  const artCanvas = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.4), new THREE.MeshStandardMaterial({
    color: 0xF5EDE0, roughness: 0.9
  }));
  artCanvas.position.set(-2.5, 5.5, -6.95);
  room.add(artCanvas);
  // Art — simple floral shapes (circles for flowers)
  [
    [0.0, 0.1], [-0.4, -0.1], [0.4, -0.1], [-0.2, 0.35], [0.2, 0.35]
  ].forEach(([ox, oy], i) => {
    const colors = [0xE8A8A0, 0xB0C8A0, 0xD0B0D8, 0xE8C880, 0xA8C0D8];
    const petal = new THREE.Mesh(
      new THREE.CircleGeometry(0.18, 16),
      new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.9 })
    );
    petal.position.set(-2.5 + ox, 5.5 + oy, -6.92);
    room.add(petal);
  });

  // ── Small decorative mirror on right wall ─────────────────────────────────
  const mirrorFrame = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.07, 16, 48),
    new THREE.MeshStandardMaterial({ color: 0xD4A76A, metalness: 0.7, roughness: 0.3 })
  );
  mirrorFrame.position.set(6.8, 5.5, -3.0);
  mirrorFrame.rotation.y = -Math.PI / 2;
  room.add(mirrorFrame);
  const mirror = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0xEEF4F8, metalness: 0.9, roughness: 0.05 })
  );
  mirror.position.set(6.78, 5.5, -3.0);
  mirror.rotation.y = -Math.PI / 2;
  room.add(mirror);

  sceneManager.scene.add(room);
  return room;
}
