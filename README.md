# Tattoo Artist Platform

## Carga de contenido (modo práctico)
Para que solo tengas que reemplazar archivos, usa estas rutas fijas:
- Fotos de galería: `assets/images/gallery/`
- Modelos 3D cuerpo completo: `assets/models/male.glb` y `assets/models/female.glb`
- Branding/texturas: `assets/images/branding/` y `assets/images/textures/`

La web carga automáticamente:
- Información del tatuador desde `data/artist.json`
- FAQ desde `data/faq.json`
- Galería desde `data/tattoos.json` (solo cambias rutas de imagen)
- Modelos 3D desde `assets/models/*.glb` si existen; si no, usa modelo de respaldo.

## Importante sobre "una sola carpeta"
En sitios estáticos (GitHub Pages) el navegador no puede listar archivos de una carpeta por sí solo. Por eso se usa `data/tattoos.json` como índice automático de imágenes: tú pones archivos en `assets/images/gallery/` y actualizas ese JSON.

## Desarrollo local
```bash
python3 -m http.server 8080
```

## Estructura modular
- `src/core`, `src/services`, `src/adapters`, `src/utils`
- `scripts/` capa web/UI
- `data/` contenido editable
- `assets/` recursos estáticos

## Datos actuales
- Tatuador: Edward Diaz
- WhatsApp: 573227660365
- Instagram: @artinink.studio
- Dirección: Carrera 80 #67-20 Bogota
