/**
 * Actualiza el título del broadcast de YouTube si hay OAuth + id de broadcast.
 * DECA_YT_STREAM_KEY: no se usa aquí (OBS ya emite con la clave del perfil); queda documentado en .env.example.
 */
export async function maybeUpdateYoutubeBroadcastTitle(title) {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;
  const broadcastId = process.env.DECA_YOUTUBE_LIVE_BROADCAST_ID;

  if (!clientId || !clientSecret || !refreshToken || !broadcastId || !title) {
    return;
  }

  try {
    const { google } = await import('googleapis');
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: refreshToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2 });
    await youtube.liveBroadcasts.update({
      part: ['snippet'],
      requestBody: {
        id: broadcastId,
        snippet: { title: String(title).slice(0, 100) },
      },
    });
    console.log('[bridge] YouTube título actualizado');
  } catch (e) {
    console.warn('[bridge] YouTube API:', e.message || e);
  }
}
