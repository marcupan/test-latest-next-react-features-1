'use client'

// Error components must be Client Components
import { useEffect } from 'react'

// eslint-disable-next-line sonarjs/no-globals-shadowing
const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="mt-4 text-neutral-500">
        {process.env.NODE_ENV === 'development'
          ? error.message
          : 'An unexpected error occurred.'}
      </p>
      <button
        className="mt-6 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  )
}

export default Error
