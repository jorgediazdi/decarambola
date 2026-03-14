# Pasos a seguir — Módulo MESAS e INSTALACIONES B2B

Sigue estos pasos en orden. Si algo falla, revisa el paso correspondiente.

---

## PASO 1 — Crear las tablas en Supabase

1. Entra en tu proyecto en **Supabase**: https://supabase.com/dashboard  
2. Abre **SQL Editor** (menú izquierdo).  
3. Abre el archivo **`supabase_mesas_instalaciones.sql`** de este proyecto.  
4. **Si NO tienes tabla `clubs`** en Supabase:  
   - En la línea que dice  
     `club_id UUID REFERENCES clubs(id) ON DELETE CASCADE`  
   - Sustituye por:  
     `club_id UUID`  
   - (Así podrás guardar configuraciones aunque no tengas clubs en la base.)  
5. Copia **todo** el contenido del archivo SQL y pégalo en el editor de Supabase.  
6. Pulsa **Run** (ejecutar).  
7. Comprueba que no haya errores en rojo. Si aparece error por tabla `clubs`, vuelve al paso 4.

**Resultado:** Quedarán creadas las tablas: `mesas_config`, `mesas`, `mesas_reservas`, `mesas_historial`, `instalaciones_componentes`, `instalaciones_mantenimiento`.

---

## PASO 2 — Ser admin del club (para ver “Panel del club”)

El bloque **PANEL DEL CLUB** en la portada solo se muestra si eres administrador del club.

**Opción A — Crear un club (eres admin):**

1. Abre **index.html** en el navegador.  
2. Toca el portal **MI CLUB**.  
3. Elige **Crear club** (o “Crear nuevo club”).  
4. Rellena nombre y ciudad y crea el club.  
5. Al crearlo se guarda `club_admin = true`.  
6. Vuelve a la portada (← MENÚ).  
7. Deberías ver el portal **PANEL DEL CLUB** (junto a JUGADOR y MI CLUB).

**Opción B — Unirte a un club donde ya eres admin:**

1. Si en **MI CLUB** → “Mis clubes” ya tienes un club con “ADMIN”, actívalo tocando ese club.  
2. Se actualizará `club_admin` y aparecerá **PANEL DEL CLUB** en la portada.

---

## PASO 3 — Configurar el salón (primera vez)

1. En la portada, toca **PANEL DEL CLUB**.  
2. Toca **CONFIGURAR INSTALACIONES** (o desde Organizador → INSTALACIONES).  
3. Si te redirige a index: no eres admin; vuelve al **Paso 2**.  
4. Completa el wizard de 4 pasos:  
   - **Paso 1:** Nombre del salón, filas y columnas (ej.: 2 filas, 4 columnas).  
   - **Paso 2:** Tipo de instalación (ej.: CARAMBOLA, POOL) y componentes (paño, bandas, etc.) con el botón **+**.  
   - **Paso 3:** Revisa el layout (vista previa).  
   - **Paso 4:** Tarifa por hora y tarifa media (y promoción si quieres).  
5. Pulsa **GUARDAR CONFIGURACIÓN**.  
6. Si hay error: comprueba que el **Paso 1** (SQL) se ejecutó bien y que la URL y la clave de Supabase en **core.js** son las correctas.

**Resultado:** Se crean un registro en `mesas_config` y varios en `mesas` e `instalaciones_componentes`. Después te lleva a **Salón en vivo**.

---

## PASO 4 — Usar el Salón en vivo

1. Entra en **SALÓN EN VIVO** (desde PANEL DEL CLUB o desde Organizador → SALÓN EN VIVO).  
2. Deberías ver el plano con las instalaciones (verde = libre, rojo = ocupada, etc.).  
3. **Abrir sesión:** toca una instalación → “Abrir sesión” → escribe el nombre del jugador/cliente.  
4. **Cerrar sesión:** toca la misma instalación → “Cerrar sesión”. Se guarda tiempo y costo en `mesas_historial` y se actualizan las horas de uso de los componentes.  
5. Puedes marcar estados: Reservada, Mantenimiento, Fuera de servicio, o volver a Libre.  
6. El plano se actualiza solo cada 30 segundos; puedes recargar la página para ver cambios al instante.

---

## PASO 5 — Ver ficha de una instalación

1. En **Salón en vivo**, toca una instalación.  
2. Elige **Ver ficha**.  
3. En la ficha verás:  
   - Horas totales, ingresos, jugador que más la usa, promedio horas/día.  
   - Semáforo de mantenimiento por componente (ÓPTIMO / DESGASTE / URGENTE).  
   - Alertas si algún componente supera las horas de uso configuradas.  
   - Historial de mantenimiento.  
4. Puedes **Registrar mantenimiento** (tipo, descripción, costo) y se guarda en historial.

---

## PASO 6 — Comprobar sesión de organizador

Las páginas B2B (mesas_config, mesas, instalacion_ficha) comprueban sesión de organizador.  
Si tras 15 minutos de inactividad te sacan a la portada, es normal. Vuelve a entrar por **PANEL DEL CLUB** o por **Organizador** y sigue usando instalaciones.

---

## Resumen rápido

| Paso | Qué hacer |
|------|-----------|
| 1 | Ejecutar **supabase_mesas_instalaciones.sql** en Supabase (y quitar `REFERENCES clubs` si no tienes tabla clubs). |
| 2 | Ser admin: **crear club** o **activar un club donde eres ADMIN** para que aparezca PANEL DEL CLUB. |
| 3 | **Configurar instalaciones** (wizard 4 pasos) y guardar. |
| 4 | Usar **Salón en vivo**: abrir/cerrar sesiones y cambiar estados. |
| 5 | Ver **ficha** de cada instalación y registrar mantenimientos. |
| 6 | Si te expulsa por inactividad, volver a entrar por Panel del club u Organizador. |

---

## Si algo no funciona

- **No veo “Panel del club”:** Haz el Paso 2 (crear club o activar club con ADMIN).  
- **Error al guardar en Configurar instalaciones:** Revisa Paso 1 (tablas creadas) y que en **core.js** estén bien `SUPABASE_URL` y `SUPABASE_KEY`.  
- **Salón en vivo vacío:** Primero completa el Paso 3 (configurar instalaciones y guardar).  
- **Ficha sin datos:** Abre/cierra alguna sesión en una instalación y registra un mantenimiento para ver estadísticas e historial.
