'use client'

import { useRouter } from 'next/navigation'
import {
  createContext,
  useEffect,
  useEffectEvent,
  useRef,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

const ModalContext = createContext<{ onDismiss: () => void } | null>(null)

const Modal = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const onDialogClose = useEffectEvent(() => {
    router.back()
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (!dialog.open) {
      dialog.showModal()
    }

    const handleClose = () => onDialogClose()

    dialog.addEventListener('close', handleClose)

    return () => dialog.removeEventListener('close', handleClose)
  }, [])

  const onDismiss = () => {
    if (dialogRef.current?.open) {
      dialogRef.current.close()
    }
  }

  const container =
    typeof document !== 'undefined'
      ? (document.getElementById('modal-root') ?? document.body)
      : null

  if (!container) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70"
      onClick={onDismiss}
    >
      <dialog
        ref={dialogRef}
        className="relative w-1/2 rounded-xl bg-white p-8"
        onClick={(e) => e.stopPropagation()}
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
          aria-label="Close modal"
          className="absolute top-2 right-2 rounded-full bg-gray-200 px-2 py-0.5 hover:bg-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          X
        </button>
      </dialog>
    </div>,
    container,
  )
}

export { Modal }
