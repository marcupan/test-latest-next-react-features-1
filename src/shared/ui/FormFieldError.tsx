type FormFieldErrorProps = {
  error: string | string[] | undefined | null
  id?: string
}

export const FormFieldError = ({ error, id }: FormFieldErrorProps) => {
  if (!error) {
    return null
  }

  const errors = Array.isArray(error) ? error : [error]

  return (
    <div id={id} aria-live="polite" role="alert">
      {errors.map((e, index) => (
        <p key={index} className="text-sm text-red-500">
          {e}
        </p>
      ))}
    </div>
  )
}
