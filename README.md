# Tattoo Artist Platform

Plataforma web profesional para tatuador con galería, páginas informativas y preview 3D de tatuajes sobre modelos humanos usando **Three.js** y arquitectura modular escalable.

## Stack
- HTML5 + CSS3
- JavaScript ES Modules
- Three.js (`r160` por CDN)
- Canvas API
- Sitio 100% estático para GitHub Pages

## Estructura principal

- `src/core`: lógica de negocio pura (estado, validaciones, reglas).
- `src/services`: casos de uso.
- `src/adapters`: integración con DOM/Three.js/archivos.
- `src/utils`: utilidades reutilizables.
- `scripts/`: módulos de la web y capa de aplicación.
- `styles/`: estilos modulares.
- `data/`: contenido desacoplado en JSON.
- `docs/`: arquitectura, deployment y optimización.

## Desarrollo local
Abrir el proyecto con un servidor estático para evitar restricciones CORS en módulos ES:

```bash
python3 -m http.server 8080
```

Abrir `http://localhost:8080`.

## Deploy en GitHub Pages
1. Subir a `main`.
2. En GitHub, activar Pages desde branch `/main` y root `/`.
3. Confirmar que las rutas son relativas (ya configuradas).

## Seguridad
- Validación de MIME type en subida de imágenes.
- Límite de tamaño de archivo.
- Sanitización básica de nombre de archivo.

## Próximas mejoras
- Integración de IA generativa para bocetos.
- Persistencia cloud opcional.
- Multi-artista y dashboard administrativo.
