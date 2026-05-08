import { qs } from './utils.js';
import { createScene } from './preview3d/sceneManager.js';
import { setupLights } from './preview3d/lightingManager.js';
import { attachControls } from './preview3d/controlsManager.js';
import { validateImage } from './services/imageLoader.js';
import { downloadCanvas } from './services/exportService.js';
import { bodyZones } from './core/constants.js';

function initGallery() {
  const grid = qs('#gallery-grid');
  if (!grid) return;
  const styles = ['Blackwork', 'Anime', 'Realismo', 'Minimalista', 'Fine line', 'Color'];
  styles.forEach((style, i) => {
    const fig = document.createElement('figure');
    fig.innerHTML = `<img loading="lazy" alt="${style}" src="https://picsum.photos/seed/tattoo-${i}/500/700" /><figcaption>${style}</figcaption>`;
    grid.appendChild(fig);
  });
}

function initPreview() {
  const canvas = qs('#preview-canvas');
  if (!canvas) return;
  const { THREE, scene, camera, renderer } = createScene(canvas);
  setupLights(THREE, scene);
  const controls = attachControls(camera, canvas);

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.2, 12, 24), new THREE.MeshStandardMaterial({ color: 0xb0a08f, roughness: 0.9 }));
  scene.add(body);

  const tattoo = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
  tattoo.position.set(0.38, 0.35, 0);
  tattoo.rotation.y = Math.PI / 2;
  scene.add(tattoo);

  const zonePositionMap = { forearm:[0.38,0.35,0], leftArm:[-0.38,0.35,0], rightArm:[0.38,0.35,0], chest:[0,0.5,0.42], back:[0,0.5,-0.42], neck:[0,1,0.25], leg:[0.22,-0.55,0.12] };

  qs('#zone-select')?.addEventListener('change', e => {
    const zone = e.target.value;
    if (bodyZones[zone]) {
      const [x, y, z] = zonePositionMap[zone] || zonePositionMap.forearm;
      tattoo.position.set(x, y, z);
      tattoo.lookAt(0, y, 0);
    }
  });

  qs('#body-select')?.addEventListener('change', e => {
    body.scale.x = e.target.value === 'female' ? 0.9 : 1;
    body.scale.z = e.target.value === 'female' ? 0.9 : 1;
  });

  qs('#tattoo-upload')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    try { validateImage(file); } catch (err) { alert(err.message); return; }
    const url = URL.createObjectURL(file);
    new THREE.TextureLoader().load(url, tex => {
      tattoo.material.map = tex;
      tattoo.material.opacity = Number(qs('#opacity')?.value || 0.85);
      tattoo.material.blending = THREE.MultiplyBlending;
      tattoo.material.needsUpdate = true;
    });
  });

  qs('#opacity')?.addEventListener('input', e => tattoo.material.opacity = Number(e.target.value));
  qs('#scale')?.addEventListener('input', e => tattoo.scale.setScalar(Number(e.target.value)));
  qs('#rotation')?.addEventListener('input', e => tattoo.rotation.z = Number(e.target.value) * Math.PI / 180);
  qs('#clear-tattoo')?.addEventListener('click', () => { tattoo.material.map = null; tattoo.material.opacity = 0; tattoo.material.needsUpdate = true; });
  qs('#reset-preview')?.addEventListener('click', () => { controls.reset(); tattoo.position.set(0.38,0.35,0); tattoo.scale.setScalar(1); });
  qs('#download-preview')?.addEventListener('click', () => downloadCanvas(canvas));

  let drag = false;
  canvas.addEventListener('pointerdown', () => drag = true);
  canvas.addEventListener('pointerup', () => drag = false);
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    tattoo.position.x += e.movementX * 0.0015;
    tattoo.position.y -= e.movementY * 0.0015;
  });

  const animate = () => { controls.update(); renderer.render(scene, camera); requestAnimationFrame(animate); };
  animate();
}

initGallery();
initPreview();
