import * as THREE from 'three';
class SceneManager {
  constructor() {
    this.canvasContainer = document.getElementById('canvas-container');

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFDF8F0);
    // Lighter fog so scene stays visible from z=12
    this.scene.fog = new THREE.FogExp2(0xFDF8F0, 0.012);

    // Camera — tuned for mobile portrait (tall, narrow aspect)
    // Use 65° FOV: portrait aspect ~0.46 means horizontal FOV = 2*atan(tan(32.5°)*0.46) ≈ 30°
    // which is enough to see the full desk + objects without extreme distortion.
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      80
    );
    this.camera.position.set(0.5, 3.8, 12);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // ACES gives beautiful warm rendering vs. Reinhard
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.canvasContainer.appendChild(this.renderer.domElement);

    // Raycaster
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Animation
    this.clock = new THREE.Clock();
    this.updatables = [];
    this.isRunning = false;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  addUpdatable(object) {
    this.updatables.push(object);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.renderer.setAnimationLoop(this.animate.bind(this));
  }

  stop() {
    this.isRunning = false;
    this.renderer.setAnimationLoop(null);
  }

  animate() {
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    for (const object of this.updatables) {
      if (object.update) object.update(delta, elapsedTime);
    }

    this.renderer.render(this.scene, this.camera);
  }

  getIntersectedObject(event, interactableObjects) {
    let clientX, clientY;
    if (event.changedTouches && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    this.mouse.x =  (clientX / window.innerWidth)  * 2 - 1;
    this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(interactableObjects, true);

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && !obj.userData.isInteractive) {
        obj = obj.parent;
      }
      return obj;
    }
    return null;
  }
}

export const sceneManager = new SceneManager();
