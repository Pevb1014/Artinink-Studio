import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export function attachControls(camera,canvas){const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;return controls;}
