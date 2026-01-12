'use client'

import { useTransition } from 'react'

import type { Comment } from '@/shared/types'

import { deleteComment } from './actions'

export default function CommentItem({ comment }: { comment: Comment }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      startTransition(async () => {
        await deleteComment(comment.id)
      })
    }
  }

  const createdAt = new Date(comment.created_at).toLocaleString()

  return (
    <li className="rounded-lg bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{comment.author_email}</p>
        <div className="flex items-center gap-4">
          <p className="text-xs text-gray-500">{createdAt}</p>
          <button
            className="text-xs text-red-600 hover:underline"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      <p className="mt-2 text-gray-800">{comment.body}</p>
    </li>
  )
}
