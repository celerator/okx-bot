import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.OKX_API_KEY;
  const secretKey = process.env.OKX_SECRET_KEY;
  const passphrase = process.env.OKX_PASSPHRASE;

  if (!apiKey || !secretKey || !passphrase) {
    return res.status(500).json({ 
      success: false, 
      error: 'Липсват API ключове в Environment Variables на Vercel!' 
    });
  }

  const method = 'GET';
  const requestPath = '/api/v5/tradingbot/grid/orders-algo-pending';
  const timestamp = new Date().toISOString();
  
  const message = timestamp + method + requestPath;
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('base64');

  try {
    const response = await fetch(`https://www.okx.com${requestPath}`, {
      method: 'GET',
      headers: {
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': passphrase,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.code !== '0') {
      return res.status(400).json({ 
        success: false, 
        error: `OKX Грешка (${data.code}): ${data.msg}` 
      });
    }

    return res.status(200).json({ success: true, data: data.data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
