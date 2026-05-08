import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
export function attachControls(camera,canvas){const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;return controls;}
