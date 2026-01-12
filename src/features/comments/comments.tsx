'use client'

import crypto from 'crypto'
import { useActionState, useId, useOptimistic, useRef } from 'react'

import type { Comment, User } from '@/shared/types'
import { useFormStatus } from 'react-dom'

import { addComment } from './actions'
import CommentItem from './CommentItem'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      disabled={pending}
    >
      {pending ? 'Adding...' : 'Add Comment'}
    </button>
  )
}

type CommentsProps = {
  taskId: string
  comments: Comment[]
  user: User
  activeOrgId: string
}

export default function Comments({
  taskId,
  comments,
  user,
  activeOrgId,
}: CommentsProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const id = useId()

  const [state, formAction] = useActionState(addComment, {})

  const [optimisticComments, addOptimisticComment] = useOptimistic<
    Comment[],
    Comment
  >(comments, (state, newComment) => [newComment, ...state])

  const handleFormAction = async (formData: FormData) => {
    const body = formData.get('body') as string
    addOptimisticComment({
      id: crypto.randomUUID(), // temporary ID
      body,
      created_at: new Date().toISOString(),
      author_email: user.email,
      task_id: taskId,
      user_id: user.id, // This will be replaced by the server
      organization_id: activeOrgId, // Use activeOrgId from props
    })
    formRef.current?.reset()
    formAction(formData)
  }

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-xl font-bold">Comments</h3>
      <form action={handleFormAction} ref={formRef} className="mb-6">
        <input type="hidden" name="taskId" value={taskId} />
        <label htmlFor={id} className="sr-only">
          Add a comment
        </label>
        <textarea
          id={id}
          name="body"
          placeholder="Add a comment..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
          rows={3}
          required
        />
        <SubmitButton />
        {state?.error && (
          <p className="mt-2 text-sm text-red-500">{state.error}</p>
        )}
      </form>

      <ul className="space-y-4">
        {optimisticComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
        {optimisticComments.length === 0 && (
          <p className="text-sm text-gray-500">No comments yet.</p>
        )}
      </ul>
    </div>
  )
}
