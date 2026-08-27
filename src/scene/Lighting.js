import * as THREE from 'three';
import { sceneManager } from './SceneManager.js';

export function setupLighting() {
  const scene = sceneManager.scene;

  // ── Warm Ambient (subtle fill) ──────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xFFF5E8, 0.4);
  scene.add(ambientLight);

  // ── Key Light (warm golden late-morning sun from upper left) ────────────
  const sunLight = new THREE.DirectionalLight(0xFFE8C0, 2.8);
  sunLight.position.set(-6, 10, 6);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width  = 2048; // High res shadows
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far  = 30;
  sunLight.shadow.camera.left   = -8;
  sunLight.shadow.camera.right  =  8;
  sunLight.shadow.camera.top    =  8;
  sunLight.shadow.camera.bottom = -8;
  sunLight.shadow.bias = -0.001;
  sunLight.shadow.radius = 4; // ultra soft edges
  scene.add(sunLight);

  // ── Window Fill Light (soft daylight coming from right side) ─────────────
  const windowLight = new THREE.DirectionalLight(0xFFF0E0, 0.4);
  windowLight.position.set(8, 5, -2);
  scene.add(windowLight);

  // ── Warm Fill (bounced light from floor/walls) ────────────────────────────
  const fillLight = new THREE.DirectionalLight(0xFFDDCC, 0.3);
  fillLight.position.set(3, 1, 8);
  scene.add(fillLight);

  // ── Subtle Top Hemisphere (sky vs ground) ────────────────────────────────
  const hemiLight = new THREE.HemisphereLight(0xFFF8F0, 0xF5E8D5, 0.2);
  scene.add(hemiLight);

  return { ambientLight, sunLight, windowLight, fillLight, hemiLight };
}
