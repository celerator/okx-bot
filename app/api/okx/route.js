import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const apiKey = process.env.OKX_API_KEY;
  const secretKey = process.env.OKX_SECRET_KEY;
  const passphrase = process.env.OKX_PASSPHRASE;

  if (!apiKey || !secretKey || !passphrase) {
    return NextResponse.json({ error: 'Липсват OKX API настройки (Environment Variables) в сървъра.' }, { status: 400 });
  }

  const timestamp = new Date().toISOString();
  const method = 'GET';
  const requestPath = '/api/v5/tradingBot/grid/orders-algo-pending?algoOrdType=grid';
  
  const message = timestamp + method + requestPath;
  const signature = crypto.createHmac('sha256', secretKey).update(message).digest('base64');

  try {
    const response = await fetch(`https://www.okx.com${requestPath}`, {
      method: 'GET',
      headers: {
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': passphrase,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.code !== '0') {
      return NextResponse.json({ error: `OKX Грешка (${data.code}): ${data.msg}` }, { status: 400 });
    }

    const rawBots = data.data || [];
    const bots = rawBots.map(b => {
      const invested = Number(b.investAmt || 0);
      const gridProfit = Number(b.gridProfit || 0);
      const fees = Number(b.fee || 0);
      const unrealizedPnl = Number(b.floatProfit || 0);
      const realizedPnl = gridProfit - fees;
      const totalPnl = realizedPnl + unrealizedPnl;
      
      return {
        id: b.algoId,
        pair: b.instId,
        status: b.state,
        invested,
        gridProfit,
        fees,
        unrealizedPnl,
        realizedPnl,
        totalPnl
      };
    });

    return NextResponse.json({ bots });
  } catch (err) {
    return NextResponse.json({ error: 'Грешка при свързване със сървърите на OKX: ' + err.message }, { status: 500 });
  }
}
