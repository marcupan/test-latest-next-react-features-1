import { z, ZodError } from 'zod'

export function getZodFieldErrors(
  error: ZodError | undefined,
  fieldName: string,
) {
  if (!error) return undefined

  const fieldErrors = z.treeifyError(error) as {
    [key: string]: string[]
  }

  return fieldErrors[fieldName]
}
