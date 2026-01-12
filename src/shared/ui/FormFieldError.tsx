type FormFieldErrorProps = {
  error: string | string[] | undefined | null
}

export function FormFieldError({ error }: FormFieldErrorProps) {
  if (!error) {
    return null
  }

  const errors = Array.isArray(error) ? error : [error]

  return (
    <div aria-live="polite">
      {errors.map((e, index) => (
        <p key={index} className="text-sm text-red-500">
          {e}
        </p>
      ))}
    </div>
  )
}
