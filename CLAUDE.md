# Proyecto: Simulación 3D del Perseverance

## Objetivo de hoy
Construir una simulación 3D del rover **Perseverance** (el robot de la NASA en Marte) durante una **clase de 60 minutos**, como parte del curso de Claude Code de Platzi.

## Descripción del proyecto
Una aplicación web interactiva que muestra una réplica 3D simplificada del rover **Perseverance** explorando la superficie de Marte.

**Qué incluye:**
- Modelo 3D del rover hecho con formas primitivas: chasis, 6 ruedas, mástil con cámara (Mastcam-Z), brazo robótico y antena.
- Terreno marciano: suelo rojizo con relieve, rocas y cielo anaranjado.
- Iluminación tipo Marte (luz solar tenue y sombras).
- Controles: mover y girar el rover con el teclado, y cámara orbital con el ratón.

**Tecnología:** **Vite + Three.js** (JavaScript, módulos ES).

**Estructura:**
- `index.html` — página
- `src/main.js` — escena, terreno, cielo, luces, lunas (y luego el rover y los controles)
- `scripts/check.mjs` — revisión automática con Playwright

**Fuera de alcance (por el tiempo):** física realista, modelos descargados externos, sonido, multijugador.

**Criterio de éxito:** al final de los 60 minutos, abrir `index.html` y poder conducir el rover por un terreno marciano en 3D.

## Reglas de trabajo
- Las instrucciones llegan por dictado de voz (en español); pueden tener errores de transcripción. Interpretar la intención.
- Mantener el proyecto simple y funcional: el tiempo es limitado (60 min).
- Todos los archivos se crean en este directorio: `D:\visual programing\perseverancia`.
- Registrar en este archivo cada paso del proceso (ver bitácora abajo).

## Plan tentativo (60 min)
1. (0-10 min) Definir tecnología y estructura del proyecto.
2. (10-25 min) Modelo 3D del rover (chasis, 6 ruedas, mástil, cámara, brazo).
3. (25-40 min) Terreno marciano, iluminación y cielo.
4. (40-55 min) Controles e interacción (mover el rover, cámara orbital).
5. (55-60 min) Pulido y revisión final.

## Bitácora del proceso
- **2026-11-09** — Se crea `CLAUDE.md` con el objetivo y el plan. Carpeta del proyecto vacía.
- **2026-11-09** — Se añade la descripción del proyecto y se decide usar Three.js (HTML + JS, sin build).
- **2026-11-09** — Se instala GitHub CLI (`gh` 2.103.3) y se inicia sesión con la cuenta **Balorofaesir** (HTTPS).
- **2026-11-09** — Se crea el repo público https://github.com/Balorofaesir/Perseverancia y se sube `CLAUDE.md`.
- **2026-11-09** — **Pedido 1: paisaje de Marte.** Proyecto con **Vite + Three.js** (cambia la decisión inicial "sin build"). `npm run dev` → http://localhost:5173.
  - Escena en `src/main.js`: dunas asimétricas procedurales, ~720 rocas instanciadas, cielo con shader (caramelo → rosado), sol de tarde con luz cálida y sombras suaves, Fobos y Deimos, polvo en suspensión, tone mapping ACES.
  - `npm run check` (`scripts/check.mjs`): Playwright (`playwright-core`, usa el Chrome instalado, headless) → captura en `screenshots/check.png` + lista de errores de consola. Requiere `npm run dev` en marcha.
  - 3 rondas de revisión: R1 404 de favicon, lunas pequeñas y oscuras, cámara tapada por una loma, montañas muy puntiagudas → corregido. R2 lunas muy blancas, sol grande → corregido. R3 sin errores, captura OK.

## Comandos
- `npm run dev` — servidor de desarrollo (http://localhost:5173)
- `npm run check` — revisión headless: captura + errores de consola (con el servidor encendido)
