export function downloadCanvas(canvas,name='tattoo-preview.png'){const a=document.createElement('a');a.download=name;a.href=canvas.toDataURL('image/png');a.click();}
