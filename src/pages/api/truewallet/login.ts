import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const SITE_KEY = '0x4AAAAAAAGL2PrskAxM0sSY';  // Turnstile site key
const API_KEY = 'b17a415bdec5aef984bb72ee8ebbec9a';  // ใส่ API key ของคุณ

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. ส่ง request ไปที่ 2captcha เพื่อแก้ turnstile
    const createTask = await axios.post(`https://2captcha.com/in.php`, null, {
      params: {
        key: API_KEY,
        method: 'turnstile',
        sitekey: SITE_KEY,
        pageurl: 'https://www.tmn.one/',
        json: 1
      }
    });

    if (!createTask.data.status) {
      throw new Error('Failed to create captcha task');
    }

    const taskId = createTask.data.request;
    console.log('Task created:', taskId);

    // 2. รอและเช็คผลลัพธ์
    let token = null;
    for (let i = 0; i < 24; i++) {  // รอสูงสุด 2 นาที
      await new Promise(resolve => setTimeout(resolve, 5000));  // รอ 5 วินาที

      const getResult = await axios.get(`https://2captcha.com/res.php`, {
        params: {
          key: API_KEY,
          action: 'get',
          id: taskId,
          json: 1
        }
      });

      if (getResult.data.status) {
        token = getResult.data.request;
        break;
      }
    }

    if (!token) {
      throw new Error('Failed to solve captcha');
    }

    console.log('Got token:', token);

    // 3. ส่ง request login พร้อม token
    const loginResponse = await axios.post('https://api.tmn.one/api.php', {
      scope: 'login',
      cmd: 'authen',
      'cf-turnstile-response': token,
      data: {
        msisdn: '0869663564',
        password: 'patiphanpreaw086'
      }
    }, {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'x-api-version': '202109071944'
      }
    });

    res.status(200).json(loginResponse.data);
  } catch (error: any) {
    console.error('Error:', error.message);
    res.status(500).json({
      message: error.message || 'Internal server error',
      error: true
    });
  }
} 