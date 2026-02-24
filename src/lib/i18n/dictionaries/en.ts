export type Dictionary = {
  common: {
    loading: string
    error: string
    success: string
    cancel: string
    save: string
    delete: string
    edit: string
    create: string
    search: string
    back: string
  }
  navigation: {
    dashboard: string
    projects: string
    auditLog: string
    logout: string
  }
  auth: {
    signIn: string
    signUp: string
    email: string
    password: string
    orgName: string
    signInToAccount: string
    createNewOrg: string
  }
  dashboard: {
    title: string
    welcome: string
    projects: string
    tasks: string
    recentActivity: string
    noActivity: string
    createdThisWeek: string
    pending: string
    completed: string
  }
  projects: {
    title: string
    newProject: string
    createProject: string
    noProjects: string
    searchProjects: string
    projectsFound: string
    projectFound: string
    backToProjects: string
  }
  tasks: {
    addTask: string
    taskTitle: string
    noTasks: string
    markComplete: string
    markPending: string
    deleteTask: string
  }
  comments: {
    addComment: string
    writeComment: string
    noComments: string
  }
}

export const en: Dictionary = {
  common: {
    loading: 'Loading…',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    back: 'Back',
  },
  navigation: {
    dashboard: 'Dashboard',
    projects: 'Projects',
    auditLog: 'Audit Log',
    logout: 'Logout',
  },
  auth: {
    signIn: 'Sign in',
    signUp: 'Sign up',
    email: 'Email address',
    password: 'Password', // eslint-disable-line sonarjs/no-hardcoded-passwords
    orgName: 'Organization Name',
    signInToAccount: 'Sign in to your account',
    createNewOrg: 'Create a new Org and User',
  },
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome to your secure workspace',
    projects: 'Projects',
    tasks: 'Tasks',
    recentActivity: 'Recent Activity',
    noActivity: 'No recent activity',
    createdThisWeek: 'created this week',
    pending: 'pending',
    completed: 'completed',
  },
  projects: {
    title: 'Projects',
    newProject: 'New project name…',
    createProject: 'Create Project',
    noProjects: 'No projects found. Create one to get started.',
    searchProjects: 'Search projects…',
    projectsFound: 'projects found',
    projectFound: 'project found',
    backToProjects: 'Back to all projects',
  },
  tasks: {
    addTask: 'Add Task',
    taskTitle: 'Task title…',
    noTasks: 'No tasks yet',
    markComplete: 'Mark as complete',
    markPending: 'Mark as pending',
    deleteTask: 'Delete task',
  },
  comments: {
    addComment: 'Add Comment',
    writeComment: 'Write your comment…',
    noComments: 'No comments yet',
  },
}
