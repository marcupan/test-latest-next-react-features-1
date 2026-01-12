import { getProjects } from '@/features/projects/data'

import ProjectsClientPage from './ProjectsClientPage'

export default async function ProjectsServerPage() {
  const projects = await getProjects()

  return <ProjectsClientPage projects={projects} />
}
