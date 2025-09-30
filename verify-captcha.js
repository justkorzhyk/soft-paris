// api/verify-captcha.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const token = req.body?.['g-recaptcha-response'] || '';
  if (!token) {
    return res.status(400).json({ ok: false, error: 'Missing captcha token' });
  }

  const secret = process.env.RECAPTCHA_SECRET;
  const params = new URLSearchParams({ secret, response: token });

  try {
    const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await r.json();

    if (!data.success) {
      return res.status(400).json({ ok: false, error: 'Captcha failed', details: data['error-codes'] });
    }

    // ✅ Captcha passed — your logic here
    // Example: redirect
    res.writeHead(303, { Location: '/thanks' });
    res.end();
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
