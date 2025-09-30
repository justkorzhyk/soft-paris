export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  // Works for form-encoded, multipart, or JSON if your form sends JSON
  const token =
    req.body?.['g-recaptcha-response'] ||
    req.body?.token ||
    '';

  if (!token) {
    return res.status(400).json({ ok: false, error: 'Missing captcha token' });
  }

  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) {
    return res.status(500).json({ ok: false, error: 'Server misconfiguration: missing secret' });
  }

  const params = new URLSearchParams();
  params.append('secret', secret);
  params.append('response', token);
  if (req.headers['x-forwarded-for']) {
    params.append('remoteip', req.headers['x-forwarded-for'].split(',')[0]);
  }

  try {
    const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await r.json();

    if (!data.success) {
      return res.status(400).json({ ok: false, error: 'Captcha verification failed', details: data['error-codes'] || [] });
    }

    // ✅ Captcha ok — continue your logic (save lead, send mail, etc.)
    return res.status(200).json({ ok: true, message: 'Captcha verified' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Verification request failed', details: err.message });
  }
}
