grep -n "salon-vista-jugador\|modo=\|salon-vista" apps/club/sala/mesas.html | head -20# Configuración OBS — DeCarambola

## Perfil OBS
- Nombre del perfil: Sin Título
- OBS versión: 32.1.0

## Stream YouTube
- Servicio: YouTube - RTMP
- Stream Key: [PEGAR AQUÍ TU STREAM KEY DE YOUTUBE]

## OBS WebSocket
- IP: 192.168.68.108
- Puerto: 4455
- Contraseña: [PEGAR AQUÍ TU CONTRASEÑA WEBSOCKET]

## Escenas configuradas
- mesa 2
- Escena 2

## Fuentes por escena
- Marcador_DeCarambola (Browser Source)
  - URL: https://decarambola.com/overlay_marcador.html?match_id=UUID_AQUI
  - Ancho: 1920 | Alto: 1080
- Dispositivo de captura de video (Insta360)

## stunnel Bridge
- Archivo config: ~/stunnel/stunnel.conf
- Contenido:
  [obs-ws]
  client = yes
  accept = 127.0.0.1:4456
  connect = 192.168.68.108:4455
- Comando para iniciar: stunnel ~/stunnel/stunnel.conf

## Netlify Variables de entorno
- DC_OBS_PASSWORD = [CONTRASEÑA OBS WEBSOCKET]
