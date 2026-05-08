import { qs } from './utils.js';
import { createScene } from './preview3d/sceneManager.js';
import { setupLights } from './preview3d/lightingManager.js';
import { attachControls } from './preview3d/controlsManager.js';
import { validateImage } from './services/imageLoader.js';
import { downloadCanvas } from './services/exportService.js';
import { loadModel } from './services/modelLoader.js';

async function getJSON(path, fallback) { try { const r = await fetch(path); return r.ok ? await r.json() : fallback; } catch { return fallback; } }

async function initContent() {
  const artist = await getJSON('data/artist.json', null);
  if (artist) {
    qs('#artist-name') && (qs('#artist-name').textContent = artist.name);
    qs('#artist-studio') && (qs('#artist-studio').textContent = `${artist.studio} · ${artist.city}`);
    qs('#artist-specialties') && (qs('#artist-specialties').textContent = artist.specialties.join(', '));
    qs('#artist-whatsapp') && (qs('#artist-whatsapp').textContent = `WhatsApp: ${artist.whatsapp}`);
    qs('#artist-instagram') && (qs('#artist-instagram').textContent = `Instagram: ${artist.instagram}`);
    qs('#artist-address') && (qs('#artist-address').textContent = artist.address);
    qs('#artist-experience') && (qs('#artist-experience').textContent = artist.experience);
  }

  const faqs = await getJSON('data/faq.json', []);
  const faqList = qs('#faq-list');
  if (faqList) faqs.forEach(({ q, a }) => { const d = document.createElement('details'); d.className = 'faq-item'; d.innerHTML = `<summary>${q}</summary><p>${a}</p>`; faqList.appendChild(d); });
}

async function initGallery() {
  const grid = qs('#gallery-grid');
  if (!grid) return;
  const tattoos = await getJSON('data/tattoos.json', []);
  tattoos.forEach(item => {
    const fig = document.createElement('figure');
    fig.innerHTML = `<img loading='lazy' alt='${item.title}' src='${item.image}' onerror="this.src='https://picsum.photos/500/700?grayscale'"/><figcaption>${item.title} · ${item.style}</figcaption>`;
    grid.appendChild(fig);
  });
}

async function initPreview() {
  const canvas = qs('#preview-canvas');
  if (!canvas) return;
  const { THREE, scene, camera, renderer, onResize } = createScene(canvas);
  setupLights(THREE, scene);
  const controls = attachControls(camera, canvas);
  controls.minDistance = 0.9;
  controls.maxDistance = 4.2;

  const fallback = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.2, 12, 24), new THREE.MeshStandardMaterial({ color: 0xb0a08f, roughness: 0.9 }));
  scene.add(fallback);
  let body = fallback;
  const status = document.createElement('p'); status.textContent = 'Cargando modelo 3D...'; status.className = 'status'; canvas.parentElement?.appendChild(status);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function fitBodyToView(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetSize = 1.8;
    const scale = targetSize / maxDim;
    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));
    model.position.y += 0.28;
    controls.target.set(0, 0.65, 0);
    camera.position.set(0, 1.25, 2.1);
    controls.update();
  }

  async function swapBody(type) {
    const path = type === 'female' ? 'assets/models/female.glb' : 'assets/models/male.glb';
    const model = await loadModel(path);
    if (model) {
      scene.remove(body);
      body = model;
      fitBodyToView(body);
      scene.add(body);
      status.textContent = `Modelo ${type} cargado. Haz clic para ubicar tatuaje.`;
    } else {
      body = fallback;
      fitBodyToView(body);
      status.textContent = `No se pudo cargar ${path}. Se usa modelo de respaldo.`;
    }
  }

  const tattoo = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), new THREE.MeshStandardMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
  tattoo.visible = false;
  scene.add(tattoo);

  function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  canvas.addEventListener('pointerdown', event => {
    if (!tattoo.material.map || !body) return;
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(body, true);
    if (!hits.length) return;
    const hit = hits[0];
    tattoo.visible = true;
    tattoo.position.copy(hit.point);
    if (hit.face?.normal) {
      const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
      tattoo.position.addScaledVector(n, 0.0035);
      tattoo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    }
    tattoo.rotateZ(Number(qs('#rotation')?.value || 0) * Math.PI / 180);
  });

  await swapBody('male');
  qs('#body-select')?.addEventListener('change', async e => { await swapBody(e.target.value); });
  qs('#tattoo-upload')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    try { validateImage(file); } catch (err) { alert(err.message); return; }
    const url = URL.createObjectURL(file);
    new THREE.TextureLoader().load(url, tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tattoo.material.map = tex;
      tattoo.material.opacity = Number(qs('#opacity')?.value || 0.85);
      tattoo.material.needsUpdate = true;
      tattoo.visible = true;
      status.textContent = 'Imagen cargada. Haz clic en el modelo para posicionar el tatuaje.';
      URL.revokeObjectURL(url);
    }, undefined, () => {
      status.textContent = 'No fue posible cargar la imagen seleccionada';
      URL.revokeObjectURL(url);
    });
  });
  qs('#opacity')?.addEventListener('input', e => tattoo.material.opacity = Number(e.target.value));
  qs('#scale')?.addEventListener('input', e => tattoo.scale.setScalar(Number(e.target.value)));
  qs('#rotation')?.addEventListener('input', e => tattoo.rotation.z = Number(e.target.value) * Math.PI / 180);
  qs('#clear-tattoo')?.addEventListener('click', () => { tattoo.material.map = null; tattoo.material.opacity = 0; tattoo.visible = false; tattoo.material.needsUpdate = true; status.textContent = 'Tatuaje eliminado'; });
  qs('#reset-preview')?.addEventListener('click', async () => { controls.reset(); tattoo.position.set(0, 0.6, 0.4); tattoo.scale.setScalar(1); await swapBody(qs('#body-select')?.value || 'male'); status.textContent = 'Preview reiniciado'; });
  qs('#download-preview')?.addEventListener('click', () => downloadCanvas(canvas));

  onResize();
  const animate = () => { controls.update(); renderer.render(scene, camera); requestAnimationFrame(animate); }; animate();
}

initContent();
initGallery();
initPreview();
