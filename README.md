# MDC · Planificación y Control de Proyectos

Web profesional de Marcos Alejandro De La Cruz, orientada a servicios freelance para contratistas y equipos industriales.

## Funciones

Cinco servicios, trayectoria interactiva, escena 3D con monorriel y grúa animados, simulador CPM con datos ficticios, seis formaciones, preguntas frecuentes y condiciones del servicio.

## Desarrollo

Requiere Node.js 22 o posterior.

```sh
npm ci
npm run typecheck
npm run build
node checks/verify.mjs
node checks/verify-3d.mjs
```

Los archivos estáticos están en `dist/`. TypeScript compila `src/*.mts` a módulos `.mjs`; la aplicación principal y el visor 3D mantienen módulos JavaScript. La comprobación `python checks/verify_assets.py` requiere Pillow.

## Editar

- `src/content.mts`: experiencia, servicios y formación.
- `src/schedule.mts`: cronograma ficticio.
- `src/mobile-experience.mts` y `src/story-navigation.mts`: interacciones móviles.
- `dist/index.html`: estructura y textos.
- `dist/styles.css`, `dist/mobile.css`, `dist/mobile-design.css`: diseño.
- `dist/industrial-model.mjs` y `dist/industrial-viewer.mjs`: modelo y cámara.

## Publicación

URL prevista: https://marcosadelacruz.github.io/marcos-project-controls/

El workflow `.github/workflows/pages.yml` comprueba, compila y publica únicamente `dist/` al actualizar `main`. En Settings → Pages → Build and deployment, seleccionar **GitHub Actions** como Source. Después ejecutar **Publicar web en GitHub Pages** desde Actions, o repetir la ejecución si empezó antes de activar Pages.

Los metadatos canonical, Open Graph y datos estructurados apuntan a esta URL. Esta copia excluye la configuración de Sites y su historial.

## Límites

El formulario prepara mensajes para correo o WhatsApp; el visitante confirma su envío en esa aplicación. No hay recepción automática ni base de datos. La escena es conceptual y no representa un BIM de un cliente.

Compilación, tipos, recursos, cálculo CPM y controles 3D comprobados por código y DOM simulado. La validación visual, foco, gestos y GPU real en Safari/Chrome móvil siguen pendientes. Revisar las inconsistencias del CV descargable antes del lanzamiento público.

## Recursos

Three.js incluye su licencia MIT en `dist/vendor/three/`. Las fuentes locales incluyen sus licencias en `dist/assets/`. Logos de empresas y emisores pertenecen a sus titulares. CV y certificados son documentos del titular del portafolio.

## Licencia

**Licencia propietaria — todos los derechos reservados.** Los materiales originales no se ofrecen bajo una licencia de código abierto. Su reutilización requiere autorización previa por escrito de Marcos Alejandro De La Cruz: marcosadelacruz@gmail.com. Consulta [LICENSE](LICENSE).

Las licencias de Three.js, fuentes y otros materiales de terceros se conservan. La licencia propietaria no cambia la visibilidad del repositorio ni los derechos derivados de las condiciones de GitHub.
