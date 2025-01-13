import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

// แก้ไขการสร้าง PrismaClient instance
const prisma = global.prisma || new PrismaClient()
if (process.env.NODE_ENV === 'development') global.prisma = prisma

interface Domain {
  id: number
  url: string
  name: string
  isActive: boolean
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const domains = await prisma.domain.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          url: true,
          name: true
        }
      })
      
      const formattedDomains = domains.map((domain: any) => ({
        id: domain.id,
        url: domain.url,
        name: domain.name || domain.url.replace('https://', '').replace('http://', '')
      }))
      
      return res.json(formattedDomains)
    }
    
    if (req.method === 'POST') {
      const { url, name } = req.body
      
      // เช็คว่ามี domain ที่ active อยู่หรือไม่
      const existingDomain = await prisma.domain.findFirst({
        where: {
          url,
          isActive: true
        }
      })

      if (existingDomain) {
        return res.status(400).json({ message: 'Domain นี้มีอยู่ในระบบแล้ว' })
      }

      const domain = await prisma.domain.create({
        data: { url, name },
        select: {
          url: true,
          name: true
        }
      })
      return res.json(domain)
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ message: 'Internal server error', error })
  }
}

// Add type for global prisma instance
declare global {
  var prisma: PrismaClient | undefined
} 