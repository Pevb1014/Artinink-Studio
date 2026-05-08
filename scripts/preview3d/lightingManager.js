export function setupLights(THREE,scene){scene.add(new THREE.HemisphereLight(0xffffff,0x222222,1.1));const key=new THREE.DirectionalLight(0xffffff,1.6);key.position.set(2,3,2);scene.add(key);}
