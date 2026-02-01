export const ProjectHeaderSkeleton = () => {
  return (
    <div className="mb-8 flex animate-pulse items-center justify-between">
      <div className="h-9 w-64 rounded bg-gray-200" />
      <div className="flex items-center gap-4">
        <div className="h-10 w-40 rounded-md bg-gray-200" />
        <div className="h-5 w-32 rounded bg-gray-200" />
      </div>
    </div>
  )
}

export const TaskListSkeleton = () => {
  return (
    <div className="mt-8">
      <div className="mb-4 h-8 w-32 animate-pulse rounded bg-gray-200" />
      <div className="mb-6 flex animate-pulse items-center gap-2">
        <div className="h-10 grow rounded-md bg-gray-200" />
        <div className="h-10 w-24 rounded-md bg-gray-200" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex animate-pulse items-center justify-between rounded-lg border bg-white p-4"
          >
            <div className="space-y-2">
              <div className="h-5 w-48 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const CommentsSkeleton = () => {
  return (
    <div className="mt-8 animate-pulse">
      <div className="mb-4 h-7 w-32 rounded bg-gray-200" />
      <div className="mb-6 space-y-2">
        <div className="h-24 w-full rounded-md bg-gray-200" />
        <div className="h-10 w-32 rounded-md bg-gray-200" />
      </div>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-4 w-48 rounded bg-gray-200" />
              <div className="flex items-center gap-4">
                <div className="h-3 w-32 rounded bg-gray-200" />
                <div className="h-3 w-16 rounded bg-gray-200" />
              </div>
            </div>
            <div className="h-4 w-full rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

export const AttachmentsSkeleton = () => {
  return (
    <div className="mt-8 animate-pulse">
      <div className="mb-4 h-7 w-32 rounded bg-gray-200" />
      <div className="mb-6 space-y-2">
        <div className="h-6 w-24 rounded bg-gray-200" />
        <div className="h-10 w-full rounded-md bg-gray-200" />
        <div className="h-10 w-32 rounded-md bg-gray-200" />
      </div>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg bg-gray-50 p-2">
            <div className="h-4 w-48 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
