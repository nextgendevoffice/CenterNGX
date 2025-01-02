import type { NextApiRequest, NextApiResponse } from 'next';
const requestPromise = require('request-promise');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { access_token } = req.body;

  try {
    const payload = {
      scope: 'member',
      cmd: 'check_balance',
      data: { access_token }
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));
    console.log('Request URL:', 'https://api.tmn.one/api.php');

    const response = await requestPromise({
      url: 'https://api.tmn.one/api.php',
      method: 'POST',
      json: true,
      resolveWithFullResponse: true,
      body: payload,
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'origin': 'https://www.tmn.one',
        'referer': 'https://www.tmn.one/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'x-api-version': '202109071944'
      }
    });

    console.log('Response status:', response.statusCode);
    console.log('Response headers:', response.headers);
    console.log('Response body:', response.body);
    
    res.status(200).json(response.body);
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error('Error details:', error);
    res.status(500).json({
      message: error.message || 'Internal server error',
      error: true
    });
  }
} 