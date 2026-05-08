import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

export async function loadModel(path) {
  try {
    const gltf = await loader.loadAsync(path);
    return gltf.scene;
  } catch {
    return null;
  }
}
