import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OKX_API_KEY;
  const secretKey = process.env.OKX_SECRET_KEY;
  const passphrase = process.env.OKX_PASSPHRASE;

  if (!apiKey || !secretKey || !passphrase) {
    return NextResponse.json({ 
      success: false, 
      error: 'Липсват API ключове в Environment Variables на Vercel!' 
    }, { status: 500 });
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
      return NextResponse.json({ 
        success: false, 
        error: `OKX Грешка (${data.code}): ${data.msg}` 
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
