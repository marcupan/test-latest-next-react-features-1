'use client'

import { useRouter } from 'next/navigation'
import { createContext, useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const ModalContext = createContext<{ onDismiss: () => void } | null>(null)

export function Modal({ children }: { children: ReactNode }) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
    }
  }, [])

  function onDismiss() {
    if (dialogRef.current?.open) {
      dialogRef.current.close()
      router.back()
    }
  }

  // Fallback to document.body if a dedicated #modal-root is not present
  const container = document.getElementById('modal-root') ?? document.body

  return createPortal(
    <div className="absolute top-0 left-0 flex h-screen w-screen items-center justify-center bg-black/70">
      <dialog
        ref={dialogRef}
        className="w-1/2 rounded-xl bg-white p-8"
        onClose={onDismiss}
        onCancel={(e) => {
          e.preventDefault()
          onDismiss()
        }}
      >
        <ModalContext.Provider value={{ onDismiss }}>
          {children}
        </ModalContext.Provider>
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 rounded-full bg-gray-200 px-2 py-0.5"
        >
          X
        </button>
      </dialog>
    </div>,
    container,
  )
}
