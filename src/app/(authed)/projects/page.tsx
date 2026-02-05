import { getProjects } from '@/features/projects/data'
import { checkPermission, getSession } from '@/lib/auth'

import ProjectsClientPage from './ProjectsClientPage'

const ProjectsServerPage = async () => {
  const session = await getSession()

  if (!session) return null

  await checkPermission(session.activeOrgId, 'read', 'project')

  const projects = await getProjects(session.activeOrgId)

  return <ProjectsClientPage projects={projects} />
}

export default ProjectsServerPage
