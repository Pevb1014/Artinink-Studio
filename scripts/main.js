import { qs } from './utils.js';
import { createScene } from './preview3d/sceneManager.js';
import { setupLights } from './preview3d/lightingManager.js';
import { attachControls } from './preview3d/controlsManager.js';
import { validateImage } from './services/imageLoader.js';
import { downloadCanvas } from './services/exportService.js';
import { bodyZones } from './core/constants.js';
import { loadModel } from './services/modelLoader.js';

async function getJSON(path, fallback) { try { const r = await fetch(path); return r.ok ? await r.json() : fallback; } catch { return fallback; } }

async function initContent() {
  const artist = await getJSON('data/artist.json', null);
  if (artist) {
    qs('#artist-name') && (qs('#artist-name').textContent = artist.name);
    qs('#artist-studio') && (qs('#artist-studio').textContent = `${artist.studio} · ${artist.city}`);
    qs('#artist-specialties') && (qs('#artist-specialties').textContent = `Especialidades: ${artist.specialties.join(', ')}`);
    qs('#artist-whatsapp') && (qs('#artist-whatsapp').textContent = `WhatsApp: ${artist.whatsapp}`);
    qs('#artist-instagram') && (qs('#artist-instagram').textContent = `Instagram: ${artist.instagram}`);
    qs('#artist-address') && (qs('#artist-address').textContent = `Dirección: ${artist.address}`);
    qs('#artist-name-home') && (qs('#artist-name-home').textContent = artist.name);
    qs('#artist-instagram-home') && (qs('#artist-instagram-home').textContent = `Instagram: ${artist.instagram}`);
    qs('#artist-whatsapp-home') && (qs('#artist-whatsapp-home').textContent = `WhatsApp: ${artist.whatsapp}`);

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

  const fallback = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.2, 12, 24), new THREE.MeshStandardMaterial({ color: 0xb0a08f, roughness: 0.9 }));
  scene.add(fallback);
  let body = fallback;
  const status = document.createElement('p'); status.textContent='Cargando modelo 3D...'; canvas.parentElement?.appendChild(status);

  async function swapBody(type) {
    const path = type === 'female' ? 'assets/models/female.glb' : 'assets/models/male.glb';
    const model = await loadModel(path);
    if (model) {
      status.textContent = `Modelo ${type} cargado`; 
      scene.remove(body);
      body = model;
      body.scale.setScalar(1.4);
      scene.add(body);
    } else {
      status.textContent = `No se encontró ${path}. Usando modelo de respaldo.`;
    }
  }

  const tattoo = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
  tattoo.position.set(0.38, 0.35, 0); tattoo.rotation.y = Math.PI / 2; scene.add(tattoo);
  const zonePositionMap = { forearm:[0.38,0.35,0], leftArm:[-0.38,0.35,0], rightArm:[0.38,0.35,0], chest:[0,0.5,0.42], back:[0,0.5,-0.42], neck:[0,1,0.25], leg:[0.22,-0.55,0.12] };

  qs('#zone-select')?.addEventListener('change', e => { const zone = e.target.value; if (bodyZones[zone]) { const [x,y,z]=zonePositionMap[zone]||zonePositionMap.forearm; tattoo.position.set(x,y,z); tattoo.lookAt(0,y,0); } });
  await swapBody('male');
  qs('#body-select')?.addEventListener('change', async e => { await swapBody(e.target.value); });
  qs('#tattoo-upload')?.addEventListener('change', e => { const file=e.target.files?.[0]; try{validateImage(file);}catch(err){alert(err.message);return;} const url=URL.createObjectURL(file); new THREE.TextureLoader().load(url,tex=>{tattoo.material.map=tex;tattoo.material.opacity=Number(qs('#opacity')?.value||0.85);tattoo.material.blending=THREE.MultiplyBlending;tattoo.visible=true;tattoo.material.needsUpdate=true;status.textContent='Tatuaje cargado correctamente';});});
  qs('#opacity')?.addEventListener('input', e => tattoo.material.opacity = Number(e.target.value));
  qs('#scale')?.addEventListener('input', e => tattoo.scale.setScalar(Number(e.target.value)));
  qs('#rotation')?.addEventListener('input', e => tattoo.rotation.z = Number(e.target.value) * Math.PI / 180);
  qs('#clear-tattoo')?.addEventListener('click', () => { tattoo.material.map = null; tattoo.material.opacity = 0; tattoo.material.needsUpdate = true; });
  qs('#reset-preview')?.addEventListener('click', () => { controls.reset(); tattoo.position.set(0.38,0.35,0); tattoo.scale.setScalar(1); });
  qs('#download-preview')?.addEventListener('click', () => downloadCanvas(canvas));

  let drag=false; canvas.addEventListener('pointerdown',()=>drag=true); canvas.addEventListener('pointerup',()=>drag=false); canvas.addEventListener('pointermove',e=>{ if(!drag)return; tattoo.position.x += e.movementX*0.0015; tattoo.position.y -= e.movementY*0.0015; });
  onResize();
  const animate=()=>{controls.update(); renderer.render(scene,camera); requestAnimationFrame(animate);}; animate();
}

initContent();
initGallery();
initPreview();
