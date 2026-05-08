export function applyTattooMaterial(mesh,texture,opacity=.85){mesh.material.map=texture;mesh.material.transparent=true;mesh.material.opacity=opacity;mesh.material.needsUpdate=true;}
