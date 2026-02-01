'use client'

import { useActionState } from 'react'

import { ZodError } from 'zod'

import { login, signup } from '@/features/auth/actions'
import { getZodFieldErrors } from '@/shared/lib/utils'
import { FormFieldError } from '@/shared/ui/FormFieldError'

const LoginForm = () => {
  const [state, formAction] = useActionState(login, {})

  const errors =
    typeof state?.message === 'object' ? (state.message as ZodError) : undefined

  return (
    <form className="space-y-6" action={formAction}>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck="false"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
        />
        <FormFieldError error={getZodFieldErrors(errors, 'email')} />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
        />
        <FormFieldError error={getZodFieldErrors(errors, 'password')} />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">{/* 'Forgot Password?' link */}</div>
      </div>

      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
        >
          Sign in
        </button>
      </div>
    </form>
  )
}

const SignupForm = () => {
  const [state, formAction] = useActionState(signup, {})

  const errors =
    typeof state?.message === 'object' ? (state.message as ZodError) : undefined

  return (
    <form className="space-y-6" action={formAction}>
      <div>
        <label
          htmlFor="orgName"
          className="block text-sm font-medium text-gray-700"
        >
          Organization Name
        </label>
        <input
          id="orgName"
          name="orgName"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
        />
        <FormFieldError error={getZodFieldErrors(errors, 'orgName')} />
      </div>
      <div>
        <label
          htmlFor="email-signup"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <input
          id="email-signup"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck="false"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
        />
        <FormFieldError error={getZodFieldErrors(errors, 'email')} />
      </div>
      <div>
        <label
          htmlFor="password-signup"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password-signup"
          name="password"
          type="password"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
        />
        <FormFieldError error={getZodFieldErrors(errors, 'password')} />
      </div>
      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
        >
          Sign up
        </button>
      </div>
    </form>
  )
}

const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <LoginForm />

        <hr className="my-8" />

        <div className="space-y-6">
          <h3 className="text-center text-xl font-bold text-gray-900">
            Create a new Org and User
          </h3>
          <SignupForm />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
