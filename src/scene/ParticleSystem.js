import * as THREE from 'three';
import { sceneManager } from './SceneManager.js';

/**
 * Particle system tuned for the warm light theme.
 * - Ambient floaters: soft peach/gold petals gently drifting
 * - burst(): golden confetti-like particles for interactions
 * - petalFloat(): upward drifting petals for special moments
 */
class ParticleSystem {
  constructor() {
    this.ambient = null;
    this.ambientGeo = null;
    this.count = 120; // light and mobile-friendly
    this._velocities = [];
    this._initAmbient();
    sceneManager.addUpdatable(this);
  }

  // ── Create a soft circular petal-like texture ─────────────────────────────
  _createPetalTexture(color1 = 'rgba(245,197,163,1)', color2 = 'rgba(212,167,106,0.8)') {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    // Oval shape (petal)
    ctx.save();
    ctx.scale(0.7, 1);
    const grad = ctx.createRadialGradient(23, 16, 0, 23, 16, 16);
    grad.addColorStop(0, color1);
    grad.addColorStop(0.5, color2);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(23, 16, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return new THREE.CanvasTexture(canvas);
  }

  _createSparkleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 14);
    grad.addColorStop(0, 'rgba(255,240,180,1)');
    grad.addColorStop(0.3, 'rgba(212,167,106,0.9)');
    grad.addColorStop(0.7, 'rgba(212,167,106,0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }

  _initAmbient() {
    this.ambientGeo = new THREE.BufferGeometry();
    const posArr = new Float32Array(this.count * 3);
    const rotArr = new Float32Array(this.count);
    this._velocities = [];

    for (let i = 0; i < this.count; i++) {
      posArr[i * 3]     = (Math.random() - 0.5) * 12;
      posArr[i * 3 + 1] = Math.random() * 9;
      posArr[i * 3 + 2] = -2 - Math.random() * 8;
      rotArr[i] = Math.random() * Math.PI * 2;
      this._velocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: 0.004 + Math.random() * 0.006,
        rot: (Math.random() - 0.5) * 0.02
      });
    }

    this.ambientGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.18,
      map: this._createPetalTexture(),
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      opacity: 0.55,
      color: 0xF5C5A3
    });

    this.ambient = new THREE.Points(this.ambientGeo, mat);
    sceneManager.scene.add(this.ambient);
  }

  update(delta, elapsedTime) {
    if (!this.ambient) return;

    const pos = this.ambientGeo.attributes.position.array;
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const v = this._velocities[i];

      // Drift upward + gentle side sway
      pos[i3]     += v.x + Math.sin(elapsedTime * 0.4 + i) * 0.001;
      pos[i3 + 1] += v.y;
      pos[i3 + 2] += Math.cos(elapsedTime * 0.3 + i * 0.5) * 0.001;

      // Reset when above ceiling
      if (pos[i3 + 1] > 9.5) {
        pos[i3]     = (Math.random() - 0.5) * 12;
        pos[i3 + 1] = -0.5;
        pos[i3 + 2] = -2 - Math.random() * 8;
      }
    }
    this.ambientGeo.attributes.position.needsUpdate = true;
  }

  /**
   * Burst of sparkle particles at a position.
   * @param {THREE.Vector3} position
   * @param {number} color - hex color
   * @param {number} count - particle count
   */
  burst(position, color = 0xD4A76A, count = 60) {
    const geo = new THREE.BufferGeometry();
    const posArr = new Float32Array(count * 3);
    const vels = [];

    for (let i = 0; i < count; i++) {
      posArr[i * 3]     = position.x;
      posArr[i * 3 + 1] = position.y;
      posArr[i * 3 + 2] = position.z;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.random() * Math.PI;
      const speed = 0.04 + Math.random() * 0.08;
      vels.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.abs(Math.cos(phi)) * speed + 0.02,
        z: Math.sin(phi) * Math.sin(theta) * speed * 0.5
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.18,
      map: this._createSparkleTexture(),
      color: new THREE.Color(color),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 1.0
    });

    const system = new THREE.Points(geo, mat);
    sceneManager.scene.add(system);

    let age = 0;
    const maxAge = 2.2;
    const updatable = {
      update: (dt) => {
        age += dt;
        if (age >= maxAge) {
          sceneManager.scene.remove(system);
          geo.dispose();
          mat.dispose();
          const idx = sceneManager.updatables.indexOf(updatable);
          if (idx > -1) sceneManager.updatables.splice(idx, 1);
          return;
        }
        const p = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          p[i * 3]     += vels[i].x;
          p[i * 3 + 1] += vels[i].y;
          p[i * 3 + 2] += vels[i].z;
          vels[i].y    -= 0.0015; // gravity
        }
        geo.attributes.position.needsUpdate = true;
        mat.opacity = Math.max(0, 1.0 - (age / maxAge) * 1.5);
      }
    };
    sceneManager.addUpdatable(updatable);
  }

  /**
   * Gentle upward petal float — for Rakhi / finale scenes
   * @param {THREE.Vector3} center
   */
  petalFloat(center, count = 30) {
    const colors = [0xF5C5A3, 0xE8BFD0, 0xD4A76A, 0xF0DEC0];
    colors.forEach(col => {
      const geo = new THREE.BufferGeometry();
      const posArr = new Float32Array(count / colors.length * 3);
      const vels = [];
      for (let i = 0; i < count / colors.length; i++) {
        posArr[i * 3]     = center.x + (Math.random() - 0.5) * 4;
        posArr[i * 3 + 1] = center.y - 1 + Math.random() * 2;
        posArr[i * 3 + 2] = center.z + (Math.random() - 0.5) * 2;
        vels.push({
          x: (Math.random() - 0.5) * 0.01,
          y: 0.015 + Math.random() * 0.015,
          z: (Math.random() - 0.5) * 0.005
        });
      }
      geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
      const mat = new THREE.PointsMaterial({
        size: 0.22,
        map: this._createPetalTexture(),
        color: new THREE.Color(col),
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        opacity: 0.8
      });
      const pts = new THREE.Points(geo, mat);
      sceneManager.scene.add(pts);

      let age = 0;
      const maxAge = 4.0;
      const upd = {
        update: (dt) => {
          age += dt;
          if (age >= maxAge) {
            sceneManager.scene.remove(pts);
            geo.dispose(); mat.dispose();
            const idx = sceneManager.updatables.indexOf(upd);
            if (idx > -1) sceneManager.updatables.splice(idx, 1);
            return;
          }
          const p = geo.attributes.position.array;
          for (let i = 0; i < vels.length; i++) {
            p[i * 3]     += vels[i].x + Math.sin(age * 1.5 + i) * 0.003;
            p[i * 3 + 1] += vels[i].y;
          }
          geo.attributes.position.needsUpdate = true;
          mat.opacity = age < 1 ? age * 0.8 : Math.max(0, 0.8 - (age - 1) / (maxAge - 1) * 0.8);
        }
      };
      sceneManager.addUpdatable(upd);
    });
  }
}

export const particleSystem = new ParticleSystem();
