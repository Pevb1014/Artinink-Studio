# Tattoo Artist Platform

## ¿Dónde cargar imágenes y modelos?
Sí. Debes cargar tus recursos en la carpeta `assets/`:
- Trabajos de galería: `assets/images/gallery/`
- Imágenes de branding: `assets/images/branding/`
- Texturas auxiliares: `assets/images/textures/`
- Modelos 3D humanos: `assets/models/male.glb` y `assets/models/female.glb`

Luego debes referenciarlos desde `data/*.json` o desde los módulos `scripts/` según corresponda.

## Desarrollo local
```bash
python3 -m http.server 8080
```

## Estructura modular
- `src/core`: reglas de negocio
- `src/services`: casos de uso
- `src/adapters`: infraestructura e integraciones
- `src/utils`: helpers reutilizables
- `scripts/`: capa web/UI
- `data/`: contenido editable
- `assets/`: recursos estáticos
- `docs/`: documentación

## Preview 3D actual
- Selector de cuerpo (male/female)
- Selector de zona corporal
- Upload PNG/JPG/WEBP
- Ajuste de opacidad, escala y rotación
- Arrastre del tatuaje en canvas
- Exportación PNG

## Nota
Para usar modelos reales GLB, coloca `male.glb` y `female.glb` en `assets/models/` y conecta `GLTFLoader` en `scripts/services/modelLoader.js`.
