'use client'

import { createContext, useContext } from 'react'

type ProjectContextType = {
  addOptimisticProject: (name: string) => void
}

export const ProjectContext = createContext<ProjectContextType | null>(null)

export function useProject() {
  const context = useContext(ProjectContext)

  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }

  return context
}
