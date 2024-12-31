import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Domain {
  id: number
  url: string
  name: string
  isActive: boolean
}

export default function DomainsPage() {
  const [newDomain, setNewDomain] = useState({ url: '', name: '' })
  const queryClient = useQueryClient()

  // แก้ไขการแสดงผล domains
  const { data: domains = [], isLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: () => fetch('/api/domains').then(res => res.json())
  })

  // Add domain mutation
  const addDomain = useMutation({
    mutationFn: (domain: { url: string; name: string }) =>
      fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(domain)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] })
      setNewDomain({ url: '', name: '' })
    }
  })

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold mb-6">จัดการ Domain</h1>

        {/* Form เพิ่ม Domain */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <form onSubmit={(e) => {
            e.preventDefault()
            addDomain.mutate(newDomain)
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  required
                  className="w-full rounded-md border-gray-300"
                  value={newDomain.url}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300"
                  value={newDomain.name}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ชื่อสำหรับจดจำ"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                disabled={addDomain.isPending}
              >
                {addDomain.isPending ? 'กำลังบันทึก...' : 'เพิ่ม Domain'}
              </button>
            </div>
          </form>
        </div>

        {/* แส้ไขการแสดงรายการ Domain */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(domains) && domains.map((domain: { url: string; name: string }, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{domain.url}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{domain.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 