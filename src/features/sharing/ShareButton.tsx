'use client'

import { useState, useTransition } from 'react'

import { createShareToken, revokeShareToken } from '@/features/sharing/actions'

export default function ShareButton({ projectId }: { projectId: string }) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [isCreatePending, startCreateTransition] = useTransition()
  const [isRevokePending, startRevokeTransition] = useTransition()

  const handleCreate = () => {
    startCreateTransition(async () => {
      const result = await createShareToken(projectId)
      if (result.shareUrl) {
        setShareUrl(result.shareUrl)
      } else {
        alert(result.error || 'Failed to create share link.')
      }
    })
  }

  const handleRevoke = () => {
    startRevokeTransition(async () => {
      const result = await revokeShareToken(projectId)
      if (result.success) {
        setShareUrl(null)
      } else {
        alert(result.error || 'Failed to revoke share link.')
      }
    })
  }

  if (shareUrl) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="w-full rounded border bg-gray-100 px-2 py-1"
        />
        <button
          onClick={() => navigator.clipboard.writeText(shareUrl)}
          className="rounded-md bg-green-600 px-4 py-2 text-white"
        >
          Copy
        </button>
        <button
          onClick={handleRevoke}
          disabled={isRevokePending}
          className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-red-400"
        >
          {isRevokePending ? 'Revoking...' : 'Revoke'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleCreate}
      disabled={isCreatePending}
      className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:bg-gray-400"
    >
      {isCreatePending ? 'Generating...' : 'Create Share Link'}
    </button>
  )
}
