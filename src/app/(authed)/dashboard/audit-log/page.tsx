import Link from 'next/link'
import { Suspense } from 'react'

import { getAuditLog } from '@/features/audit-log/data'

const AuditLogList = async () => {
  const auditLog = await getAuditLog()

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
          >
            Action
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
          >
            User
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
          >
            Date
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
          >
            Details
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {auditLog.map((log) => (
          <tr key={log.id}>
            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
              {log.action}
            </td>
            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
              {log.user_email}
            </td>
            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
              {new Date(log.created_at).toLocaleString()}
            </td>
            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
              <pre className="text-xs">
                {JSON.stringify(log.payload, null, 2)}
              </pre>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const AuditLogPage = async () => {
  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Audit Log</h1>
      <Link
        href="/dashboard"
        className="mb-8 block text-blue-500 hover:underline"
      >
        &larr; Back to dashboard
      </Link>
      <div className="rounded-lg bg-white p-8 shadow-md">
        <Suspense fallback={<div>Loading audit log...</div>}>
          <AuditLogList />
        </Suspense>
      </div>
    </div>
  )
}

export default AuditLogPage
