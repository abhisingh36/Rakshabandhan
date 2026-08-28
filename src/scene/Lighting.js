import * as THREE from 'three';
import { sceneManager } from './SceneManager.js';

/**
 * Premium cinematic lighting setup
 * – Warm golden-hour key light
 * – Blue-tinted rim/fill from opposite side (colour contrast)
 * – Animated flickering lamp point light
 * – Strong ACES tone mapping already set in SceneManager
 */
export function setupLighting() {
  const scene = sceneManager.scene;

  // ── 1. Hemisphere sky/ground (rich colour contrast) ──────────────────────
  const hemi = new THREE.HemisphereLight(0xFFE8C8, 0xC8A07A, 0.45);
  scene.add(hemi);

  // ── 2. Primary warm key light (golden afternoon sun, raking angle) ────────
  const sunLight = new THREE.DirectionalLight(0xFFD49A, 3.4);
  sunLight.position.set(-5, 9, 7);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width  = 4096;
  sunLight.shadow.mapSize.height = 4096;
  sunLight.shadow.camera.near   = 0.5;
  sunLight.shadow.camera.far    = 35;
  sunLight.shadow.camera.left   = -10;
  sunLight.shadow.camera.right  =  10;
  sunLight.shadow.camera.top    =  10;
  sunLight.shadow.camera.bottom = -10;
  sunLight.shadow.bias          = -0.0008;
  sunLight.shadow.radius        = 6;       // very soft PCF shadows
  sunLight.shadow.normalBias    = 0.03;
  scene.add(sunLight);

  // ── 3. Cool window fill from right (creates colour-temperature contrast) ──
  const windowLight = new THREE.DirectionalLight(0xC8DCFF, 0.9);
  windowLight.position.set(9, 6, -3);
  scene.add(windowLight);

  // ── 4. Warm bounce from floor ──────────────────────────────────────────────
  const bounceLight = new THREE.DirectionalLight(0xFFCA90, 0.35);
  bounceLight.position.set(0, -2, 4);
  scene.add(bounceLight);

  // ── 5. Lamp point light (warm, animated) — positioned at side-table lamp ──
  const lampLight = new THREE.PointLight(0xFFB060, 1.8, 6, 1.8);
  lampLight.position.set(4.8, 2.3, -2.0);
  lampLight.castShadow = true;
  lampLight.shadow.mapSize.width  = 512;
  lampLight.shadow.mapSize.height = 512;
  lampLight.shadow.bias = -0.004;
  scene.add(lampLight);

  // ── 6. Back-wall accent (light from behind desk area) ─────────────────────
  const backAccent = new THREE.PointLight(0xFFE0B0, 0.6, 8, 2);
  backAccent.position.set(0, 6, -6.5);
  scene.add(backAccent);

  // ── 7. Fairy-light cluster glow (warm scattered) ──────────────────────────
  const fairyGlow = new THREE.PointLight(0xFFE090, 0.5, 10, 2);
  fairyGlow.position.set(-1, 7.5, -3);
  scene.add(fairyGlow);

  // ── Animate lamp flicker every frame ─────────────────────────────────────
  let t = 0;
  sceneManager.addUpdatable({
    update(delta) {
      t += delta;
      // Subtle flicker: fast small noise
      const flicker = 1 + Math.sin(t * 11.3) * 0.04 + Math.sin(t * 7.1) * 0.025;
      lampLight.intensity = 1.8 * flicker;
      fairyGlow.intensity = 0.5 + Math.sin(t * 2.3) * 0.08;
    }
  });

  return { hemi, sunLight, windowLight, bounceLight, lampLight, backAccent, fairyGlow };
}
