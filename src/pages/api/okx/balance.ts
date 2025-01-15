import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const API_KEY = '78964d15-b59d-463d-9a36-a2fa54c7b4be';
const SECRET_KEY = '4F83368C46C4DFB2233CFD6494513003';
const PASSPHRASE = '@Aa123456Aa'; // ใส่ passphrase ที่ตั้งไว้ตอนสร้าง API key

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const timestamp = new Date().toISOString();
    const method = 'GET';
    const requestPath = '/api/v5/asset/balances?ccy=USDT'; // เพิ่มพารามิเตอร์ ccy=USDT
    
    const prehash = timestamp + method + requestPath;
    const signature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(prehash)
      .digest('base64');

    const headers = {
      'OK-ACCESS-KEY': API_KEY,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': PASSPHRASE,
      'Content-Type': 'application/json'
    };

    const response = await fetch('https://www.okx.com' + requestPath, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OKX API Error: ${errorData.msg}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error in API handler:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Internal server error'
    });
  }
} 