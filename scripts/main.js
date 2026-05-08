import {qs} from './utils.js';
import {createScene} from './preview3d/sceneManager.js';
import {setupLights} from './preview3d/lightingManager.js';
import {attachControls} from './preview3d/controlsManager.js';
import {validateImage} from './services/imageLoader.js';
import {downloadCanvas} from './services/exportService.js';

const canvas=qs('#preview-canvas');
if(canvas){
  const {THREE,scene,camera,renderer}=createScene(canvas);
  setupLights(THREE,scene);
  const controls=attachControls(camera,canvas);
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.45,1.2,8,16),new THREE.MeshStandardMaterial({color:0x999999,metalness:.2,roughness:.75}));
  scene.add(body);
  qs('#tattoo-upload')?.addEventListener('change',e=>{const file=e.target.files?.[0];try{validateImage(file);}catch(err){alert(err.message);}});
  qs('#download-preview')?.addEventListener('click',()=>downloadCanvas(canvas));
  const animate=()=>{controls.update();renderer.render(scene,camera);requestAnimationFrame(animate);};
  animate();
}
