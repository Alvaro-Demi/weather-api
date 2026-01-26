async function sendSlackError(text) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
  } catch (err) {
    // Importante: nunca romper la API si Slack falla
    console.error('Error enviando a Slack:', err.message);
  }
}

module.exports = { sendSlackError };
