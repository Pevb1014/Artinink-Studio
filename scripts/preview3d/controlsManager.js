import {OrbitControls} from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js?module';
export function attachControls(camera,canvas){const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;return controls;}
