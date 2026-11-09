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

**Tecnología (decisión tomada):** HTML + JavaScript con **Three.js** (sin instalación ni build; se abre en el navegador).

**Estructura prevista:**
- `index.html` — página y carga de Three.js
- `main.js` — escena, rover, terreno y controles

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
