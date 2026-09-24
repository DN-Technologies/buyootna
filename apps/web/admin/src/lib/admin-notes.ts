import { api } from './api'

export interface AdminNoteAuthor {
  id: string
  name: string | null
  email: string | null
}

export interface AdminNoteRow {
  id: string
  targetUserId: string
  authorAdminId: string | null
  authorAdmin: AdminNoteAuthor | null
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export async function fetchUserNotes(userId: string): Promise<AdminNoteRow[]> {
  const res = await api.get(`/admin/users/${userId}/notes`)
  return res.data
}

export interface CreateNoteInput {
  title?: string
  content: string
}

export async function createNote(userId: string, data: CreateNoteInput) {
  const res = await api.post(`/admin/users/${userId}/notes`, data)
  return res.data
}

export async function updateNote(noteId: string, content: string) {
  const res = await api.patch(`/admin/notes/${noteId}`, { content })
  return res.data
}

export async function deleteNote(noteId: string): Promise<{ message: string }> {
  const res = await api.delete(`/admin/notes/${noteId}`)
  return res.data
}
