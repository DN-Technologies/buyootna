import { api } from './api'

export interface AdminProjectRow {
  id: string
  identityId: string
  title: string
  description: string
  images: string[]
  createdAt: string
  updatedAt: string
}

export async function fetchUserProjects(
  userId: string,
  identityId?: string,
): Promise<AdminProjectRow[]> {
  const res = await api.get(`/admin/users/${userId}/projects`, {
    params: { identityId },
  })
  return res.data
}

export async function deleteProject(
  projectId: string,
): Promise<{ message: string }> {
  const res = await api.delete(`/admin/projects/${projectId}`)
  return res.data
}
