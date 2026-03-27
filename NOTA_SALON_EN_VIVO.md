# Salón en vivo y Configurar instalaciones

## Qué es "Salón en vivo"

**Salón en vivo** = **mesas.html**  
Pantalla donde se ve el **estado de las mesas del club en vivo** (libre, ocupada, reservada, mantenimiento), se abre/cierra uso de mesa y se gestionan reservas. Es del **club**, no del organizador del torneo.

## Dónde está en la app

- Está **solo en MI CLUB** (no en Organizador).
- Aparece dentro de **Administrar mi club**, así que solo lo ves cuando tienes un club y eres **admin** de ese club (has creado el club o te uniste y te dieron admin).
- Pasos: Inicio → tarjeta **MI CLUB** → si ya tienes club activo como admin, verás la sección **MESAS E INSTALACIONES** con:
  - **Salón en vivo** → mesas.html
  - **Configurar instalaciones** → mesas_config.html
  - Reservas, Historial

## URL correcta (evita “página no encontrada”)

En el sitio publicado, **Salón en vivo** vive en:

**`https://TU-DOMINIO/apps/club/sala/mesas.html`**

- **Incorrecto (suele dar 404 en Netlify):** `/club/sala/mesas.html` (falta `apps/`).
- También existe copia en la raíz **`/mesas.html`** por compatibilidad; la ruta canónica del portal club es la de `apps/club/sala/`.

Tras deploy, si alguien comparte un enlace viejo sin `apps/`, el sitio redirige automáticamente (ver `_redirects`).

## Si le das clic y no pasa nada

1. Confirma que abriste el panel **MI CLUB** o **Portal club** (no solo Organizador).
2. Confirma que tienes un **club activo** y que eres **admin** de ese club (si no, la sección no se muestra).
3. Prueba abrir directo: **`/apps/club/sala/mesas.html`** (o tu dominio + esa ruta). Si también falla, probá **`/mesas.html`** en la raíz.

## Organizador vs Club (administrador del club)

- **ORGANIZADOR** = quien hace/administra el **torneo** (crear torneo, inscripciones, control, brackets, posiciones, certificados). Los clubs no se encargan de eso. No incluye mesas, reservas ni historial de mesas.
- **MI CLUB** = administrador del club: sede, mesas, instalaciones, **reservas**, **historial** (de mesas), configurar sede, personalizar. Ahí están **Salón en vivo**, **Configurar instalaciones**, **Reservas** e **Historial**. Todo eso es del club, no del organizador del torneo.
