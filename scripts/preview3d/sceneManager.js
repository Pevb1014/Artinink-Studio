import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function createScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  const width = Math.max(canvas.clientWidth || 800, 320);
  const height = Math.max(canvas.clientHeight || 520, 320);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 1.3, 3);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);

  const onResize = () => {
    const w = Math.max(canvas.clientWidth || canvas.parentElement?.clientWidth || 800, 320);
    const h = Math.max(canvas.clientHeight || 520, 320);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  window.addEventListener('resize', onResize);

  return { THREE, scene, camera, renderer, onResize };
}
