import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { access_token } = req.body;
    
    const response = await axios.post('https://api.tmn.one/api.php', {
      scope: 'api_keys',
      cmd: 'list',
      data: { access_token }
    }, {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'x-api-version': '202109071944'
      }
    });

    res.status(200).json(response.data);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
} 