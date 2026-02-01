'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, type ChangeEvent, type FormEvent } from 'react'

import { deleteAttachment } from './actions'

const Attachments = ({
  taskId,
  attachments,
}: {
  taskId: string
  attachments: Array<{ id: string; filename: string; file_type: string }>
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0] ?? null)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a file.')
      return
    }

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('taskId', taskId)

    try {
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)

      setError(message)
    } finally {
      setIsUploading(false)
      setFile(null)

      const fileInput = document.getElementById(
        'file-input',
      ) as HTMLInputElement

      if (fileInput) {
        fileInput.value = ''
      }
    }
  }

  const handleDelete = async (attachmentId: string) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await deleteAttachment(attachmentId)

        router.refresh()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)

        setError(message)
      }
    }
  }

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-xl font-bold">Attachments</h3>
      <form onSubmit={handleSubmit} className="mb-6">
        <label htmlFor="file-input" className="mb-2 block text-sm font-medium">
          Upload File
        </label>
        <input
          id="file-input"
          name="file"
          type="file"
          onChange={handleFileChange}
          className="mb-2 block"
        />
        <button
          type="submit"
          disabled={isUploading || !file}
          aria-busy={isUploading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-400"
        >
          {isUploading ? 'Uploading…' : 'Upload File'}
        </button>
        {error && (
          <p className="mt-2 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </form>

      <ul className="space-y-4">
        {attachments.map((attachment) => (
          <li key={attachment.id} className="rounded-lg bg-gray-50 p-2">
            {attachment.file_type.startsWith('image/') ? (
              <div>
                <Image
                  src={`/api/uploads/${attachment.id}`}
                  alt={attachment.filename}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="mb-2 h-auto w-full rounded-lg"
                />
                <a
                  href={`/api/uploads/${attachment.id}`}
                  className="rounded text-sm text-blue-600 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  download
                >
                  Download {attachment.filename}
                </a>
                <button
                  onClick={() => handleDelete(attachment.id)}
                  aria-label={`Delete attachment ${attachment.filename}`}
                  className="ml-4 rounded text-sm text-red-600 hover:underline focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  Delete
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <a
                  href={`/api/uploads/${attachment.id}`}
                  className="truncate rounded text-blue-600 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  download
                >
                  {attachment.filename}
                </a>
                <button
                  onClick={() => handleDelete(attachment.id)}
                  aria-label={`Delete attachment ${attachment.filename}`}
                  className="ml-2 shrink-0 rounded text-sm text-red-600 hover:underline focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
        {attachments.length === 0 && (
          <p className="text-sm text-gray-500">No attachments yet.</p>
        )}
      </ul>
    </div>
  )
}

export default Attachments
