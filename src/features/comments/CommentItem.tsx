'use client'

import { memo, useMemo, useTransition } from 'react'

import type { Comment } from '@/shared/types'

import { deleteComment } from './actions'

const CommentItem = ({ comment }: { comment: Comment }) => {
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      startTransition(async () => {
        await deleteComment(comment.id)
      })
    }
  }

  const createdAt = useMemo(
    () => new Date(comment.created_at).toLocaleString(),
    [comment.created_at],
  )

  return (
    <li className="rounded-lg bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <p className="truncate text-sm font-semibold">{comment.author_email}</p>
        <div className="flex shrink-0 items-center gap-4">
          <p className="text-xs text-gray-500">{createdAt}</p>
          <button
            aria-label={`Delete comment by ${comment.author_email}`}
            aria-busy={isPending}
            className="rounded text-xs text-red-600 hover:underline focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
      <p className="mt-2 wrap-break-word text-gray-800">{comment.body}</p>
    </li>
  )
}

export default memo(CommentItem)
