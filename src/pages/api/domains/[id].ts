import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = global.prisma || new PrismaClient()
if (process.env.NODE_ENV === 'development') global.prisma = prisma

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'DELETE') {
      const { id } = req.query
      
      const domain = await prisma.domain.update({
        where: { id: Number(id) },
        data: { isActive: false }
      })
      
      return res.json(domain)
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ message: 'Internal server error', error })
  }
} 