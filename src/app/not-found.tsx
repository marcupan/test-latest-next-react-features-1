import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-3xl font-bold">404 - Not Found</h2>
      <p className="mt-4 text-neutral-500">
        Could not find the requested page.
      </p>
      <Link href="/" className="mt-6 text-blue-500 hover:underline">
        Return Home
      </Link>
    </div>
  )
}
