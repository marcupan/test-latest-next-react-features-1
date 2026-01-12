export type User = {
  id: string
  email: string
  organizations: Array<{
    id: string
    name: string
    role: 'admin' | 'member'
  }>
}

export type Comment = {
  id: string
  body: string
  created_at: string
  author_email: string
  user_id?: string
  task_id?: string
  organization_id?: string
}

export type Attachment = {
  id: string
  file_name: string
  file_type: string
  file_size: number
  created_at: string
}

export type AuditLog = {
  id: string
  action: string
  created_at: string
  user_email: string
  payload: unknown
}
