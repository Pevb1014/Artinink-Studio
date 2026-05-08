import { qs } from './utils.js';
import { createScene } from './preview3d/sceneManager.js';
import { setupLights } from './preview3d/lightingManager.js';
import { attachControls } from './preview3d/controlsManager.js';
import { validateImage } from './services/imageLoader.js';
import { downloadCanvas } from './services/exportService.js';
import { loadModel } from './services/modelLoader.js';

async function getJSON(path, fallback) { try { const r = await fetch(path); return r.ok ? await r.json() : fallback; } catch { return fallback; } }

function setText(selector, value) {
  document.querySelectorAll(selector).forEach(node => { node.textContent = value; });
}

async function initContent() {
  const artist = await getJSON('data/artist.json', null);
  if (artist) {
    setText('#artist-name', artist.name);
    setText('#artist-studio', `${artist.studio} · ${artist.city}`);
    setText('#artist-specialties', artist.specialties.join(', '));
    setText('#artist-whatsapp', `WhatsApp: ${artist.whatsapp}`);
    setText('#artist-instagram', `Instagram: ${artist.instagram}`);
    setText('#artist-address, #artist-address-contact', artist.address);
    setText('#artist-experience', artist.experience);
  }

  const faqs = await getJSON('data/faq.json', []);
  const faqList = qs('#faq-list');
  if (faqList) faqs.forEach(({ q, a }) => { const item = document.createElement('article'); item.className = 'faq-item panel'; item.innerHTML = `<h3>${q}</h3><p>${a}</p>`; faqList.appendChild(item); });
}

function initSectionMenu() {
  const toggle = qs('#menu-toggle');
  const menu = qs('#menu-sections');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

async function initGallery() {
  const root = qs('#gallery-grid');
  if (!root) return;
  const tattoos = await getJSON('data/tattoos.json', []);
  const styleDescriptions = {
    Blackwork: 'Trazos sólidos, alto contraste y piezas con presencia visual fuerte.',
    Anime: 'Diseños inspirados en personajes, escenas y estética del anime.',
    Realismo: 'Sombras y detalle para lograr un acabado natural y profundo.',
    Minimalista: 'Líneas limpias, piezas sutiles y composiciones simples con personalidad.'
  };

  const byStyle = tattoos.reduce((acc, item) => {
    if (!item?.style || !item?.image) return acc;
    (acc[item.style] ||= []).push(item);
    return acc;
  }, {});

  Object.entries(byStyle).forEach(([style, items]) => {
    if (!items.length) return;
    const section = document.createElement('section');
    section.className = 'gallery-style panel';
    section.innerHTML = `<header><h2>${style}</h2><p>${styleDescriptions[style] || 'Colección del estilo disponible en el estudio.'}</p></header><div class='gallery-style-track'></div>`;

    const track = section.querySelector('.gallery-style-track');
    const slides = [...items, ...items];

    slides.forEach((item, index) => {
      const card = document.createElement('figure');
      card.className = 'gallery-style-card';
      if (index >= items.length) card.setAttribute('aria-hidden', 'true');
      card.innerHTML = `<img loading='lazy' alt='${item.title}' src='${item.image}'/><figcaption>${item.title}</figcaption>`;
      track.appendChild(card);
    });

    track.style.setProperty('--gallery-speed', `${Math.max(items.length * 4, 16)}s`);
    root.appendChild(section);
  });
}




function getWhatsappLink(phone, name, idea) {
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  if (!cleanPhone) return '';
  const text = `Hola, soy ${name}. Quiero cotizar este tatuaje: ${idea}`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

function initContactForm() {
  const form = qs('#contact-form');
  if (!form) return;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const name = qs('#contact-name')?.value?.trim();
    const idea = qs('#contact-idea')?.value?.trim();
    if (!name || !idea) return alert('Completa tu nombre y la idea del tatuaje.');
    const artist = await getJSON('data/artist.json', null);
    const link = getWhatsappLink(artist?.whatsapp, name, idea);
    if (!link) return alert('No fue posible obtener el número de WhatsApp.');
    window.open(link, '_blank', 'noopener');
  });
}

function initContactMap() {
  const button = qs('#load-map');
  const map = qs('#studio-map');
  if (!button || !map) return;
  button.addEventListener('click', () => {
    if (!map.src) map.src = map.dataset.src || '';
    map.style.display = 'block';
    button.remove();
  }, { once: true });
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
initSectionMenu();

initContactMap();
initContactForm();
