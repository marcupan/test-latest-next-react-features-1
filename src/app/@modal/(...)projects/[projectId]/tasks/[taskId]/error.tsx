'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// eslint-disable-next-line sonarjs/no-globals-shadowing
const Error = ({ error }: { error: Error & { digest?: string } }) => {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-red-600">Something went wrong!</h2>
      <p className="mt-4 text-neutral-500">
        {process.env.NODE_ENV === 'development'
          ? error.message
          : 'An unexpected error occurred.'}
      </p>
      <button
        className="mt-6 rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
        onClick={() => router.back()}
      >
        Go back
      </button>
    </div>
  )
}

export default Error
