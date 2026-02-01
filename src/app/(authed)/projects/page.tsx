import { getProjects } from '@/features/projects/data'

import ProjectsClientPage from './ProjectsClientPage'

const ProjectsServerPage = async () => {
  const projects = await getProjects()

  return <ProjectsClientPage projects={projects} />
}

export default ProjectsServerPage
