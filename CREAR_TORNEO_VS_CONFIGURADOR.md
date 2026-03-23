# Diferencia: Crear torneo vs Configurar formato

## Cómo está hoy

### Crear torneo (`torneo_crear.html`)
**Es el flujo completo para crear un torneo.** 5 pasos:

1. **Información**: Sitio/Club, nombre del torneo, fecha, modalidad (3 bandas / libre).
2. **Formato y cupo**: Elegir sistema (eliminación directa, grupos+llaves, survivor) **o** ir al Configurador avanzado, configurar allí y volver con el formato ya cargado. Luego cupo (8, 16, 32, 64 o número exacto).
3. **Reglas de partida**: Tiempo por entrada (30/40/60 s), meta de carambolas, reglamento escrito.
4. **Bolsa**: Inscripción, aporte club, % premios, distribución (1º, 2º, 3º).
5. **Publicar**: Resumen y botón crear → torneo creado, vas a Inscripciones.

**Resultado:** Torneo creado y listo para inscripciones.

---

### Configurar formato (`Configurador formato.html`)
**No crea el torneo.** Solo define la “plantilla” del formato:

1. **Número de jugadores** (8, 12, 16, 24, 32, 48, 64 o custom).
2. **Elegir formato**: Muchas opciones predefinidas (grupos + llaves, doble eliminación, triple fase, etc.) según ese número.
3. **Reglas de partida**: Carambolas (directo o al mejor de sets), handicap (no / auto / manual).
4. **Resumen**: Cómo quedaría el torneo (rondas, partidas).
5. **“USAR ESTE FORMATO”**: Guarda la configuración en `FORMATO_TORNEO` (localStorage) y **redirige a Crear torneo**. Ahí el paso 2 muestra “Formato importado del Configurador” y el paso 3 puede usar esas reglas.

**Resultado:** No se crea ningún torneo. Solo se guarda una configuración que se usa *dentro* de Crear torneo.

---

## Resumen

| | Crear torneo | Configurar formato |
|---|--------------|--------------------|
| **Qué hace** | Crea el torneo de punta a punta (nombre, fecha, formato, reglas, premios) | Solo diseña formato + reglas de partida |
| **Nombre, fecha, sede** | Sí (paso 1) | No |
| **Premios / bolsa** | Sí (paso 4) | No |
| **Estructura (rondas, grupos, llaves)** | Opción simple (brackets, grupos, survivor) o importar del Configurador | Sí, muchas variantes |
| **Reglas de partida** | Básicas (tiempo, meta carambolas) | Avanzadas (sets, handicap) |
| **Al terminar** | Torneo creado → Inscripciones | Redirige a Crear torneo con el formato cargado |

---

## Por qué puede confundir

Configurar formato **parece** “crear torneo desde cero hasta elegir el formato” porque:

- Tiene pasos (jugadores → formato → reglas → resumen).
- El resumen dice “así quedaría el torneo”.
- Al final redirige a Crear torneo.

Pero **no pide** nombre, fecha, sede ni premios, y **no crea** el torneo. Solo prepara la parte “técnica” (estructura + reglas) para usarla en Crear torneo.

---

## Opciones para un cambio

1. **Dejar como está y solo aclarar**  
   - Textos en ambas pantallas (ya añadidos) que digan:  
     - Configurador: “Solo defines estructura y reglas; al terminar vas a Crear torneo para nombre, fecha y premios.”  
     - Crear torneo: “Opcional: diseña el formato en el Configurador y lo importas aquí.”

2. **Unificar en un solo flujo “Crear torneo”**  
   - Integrar los pasos del Configurador como pasos intermedios de Crear torneo (ej. después de “Formato y cupo” un “Formato avanzado” opcional con número de jugadores, estructura y reglas detalladas), sin pantalla separada.

3. **Renombrar para que se entienda**  
   - Por ejemplo:  
     - “Crear torneo” → igual.  
     - “Configurar formato” → “Diseñar formato (luego crear torneo)” o “Plantilla de formato para tu torneo”.

4. **Cambiar el final del Configurador**  
   - En vez de solo “USAR ESTE FORMATO” → ir a Crear torneo, podría decir algo como: “Llevar este formato a Crear torneo” y opcionalmente abrir Crear torneo ya en el paso 2 (Formato).

Si me dices si prefieres unificar todo en un solo flujo o solo aclarar/renombrar, se puede bajar a cambios concretos en pasos y textos de cada pantalla.
