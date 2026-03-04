'use client'

import { useActionState, useId } from 'react'
import { useFormStatus } from 'react-dom'
import { ZodError } from 'zod'

import { login, signup } from '@/features/auth/actions'
import { useTranslations } from '@/lib/i18n/client'
import { getZodFieldErrors } from '@/shared/lib/utils'
import { FormFieldError } from '@/shared/ui/FormFieldError'

const SubmitButton = ({
  label,
  pendingLabel,
  className = 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
}: {
  label: string
  pendingLabel: string
  className?: string
}) => {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      aria-busy={pending}
      disabled={pending}
      className={`flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50 ${className}`}
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

const LoginForm = () => {
  const [state, formAction] = useActionState(login, {})
  const t = useTranslations()

  const emailId = useId()
  const passwordId = useId()

  const errors =
    typeof state?.message === 'object' ? (state.message as ZodError) : undefined

  return (
    <form className="space-y-6" action={formAction}>
      <div>
        <label
          htmlFor={emailId}
          className="block text-sm font-medium text-gray-700"
        >
          {t.auth.email}
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck="false"
          required
          aria-describedby={errors ? `${emailId}-error` : undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
        />
        <FormFieldError
          error={getZodFieldErrors(errors, 'email')}
          id={`${emailId}-error`}
        />
      </div>

      <div>
        <label
          htmlFor={passwordId}
          className="block text-sm font-medium text-gray-700"
        >
          {t.auth.password}
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-describedby={errors ? `${passwordId}-error` : undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
        />
        <FormFieldError
          error={getZodFieldErrors(errors, 'password')}
          id={`${passwordId}-error`}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">{/* 'Forgot Password?' link */}</div>
      </div>

      <div>
        <SubmitButton label={t.auth.signIn} pendingLabel="Signing in…" />
      </div>
    </form>
  )
}

const SignupForm = () => {
  const [state, formAction] = useActionState(signup, {})
  const t = useTranslations()

  const orgNameId = useId()
  const emailId = useId()
  const passwordId = useId()

  const errors =
    typeof state?.message === 'object' ? (state.message as ZodError) : undefined

  return (
    <form className="space-y-6" action={formAction}>
      <div>
        <label
          htmlFor={orgNameId}
          className="block text-sm font-medium text-gray-700"
        >
          {t.auth.orgName}
        </label>
        <input
          id={orgNameId}
          name="orgName"
          type="text"
          required
          aria-describedby={errors ? `${orgNameId}-error` : undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
        />
        <FormFieldError
          error={getZodFieldErrors(errors, 'orgName')}
          id={`${orgNameId}-error`}
        />
      </div>
      <div>
        <label
          htmlFor={emailId}
          className="block text-sm font-medium text-gray-700"
        >
          {t.auth.email}
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck="false"
          required
          aria-describedby={errors ? `${emailId}-error` : undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
        />
        <FormFieldError
          error={getZodFieldErrors(errors, 'email')}
          id={`${emailId}-error`}
        />
      </div>
      <div>
        <label
          htmlFor={passwordId}
          className="block text-sm font-medium text-gray-700"
        >
          {t.auth.password}
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          required
          aria-describedby={errors ? `${passwordId}-error` : undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
        />
        <FormFieldError
          error={getZodFieldErrors(errors, 'password')}
          id={`${passwordId}-error`}
        />
      </div>
      <div>
        <SubmitButton
          label={t.auth.signUp}
          pendingLabel="Creating account…"
          className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
        />
      </div>
    </form>
  )
}

const LoginPage = () => {
  const t = useTranslations()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {t.auth.signInToAccount}
          </h2>
        </div>
        <LoginForm />

        <hr className="my-8" />

        <div className="space-y-6">
          <h3 className="text-center text-xl font-bold text-gray-900">
            {t.auth.createNewOrg}
          </h3>
          <SignupForm />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
