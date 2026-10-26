'use client'

/**
 * Sends a change to /api/t/<path> and returns the JSON, or throws an Error
 * with the API's (Arabic) message. A 401 sends the tester to /login.
 */
export async function mutate<T>(
  path: string,
  method: 'POST' | 'PATCH' | 'PUT',
  body?: unknown,
): Promise<T> {
  const res = await fetch(`/api/t/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (res.status === 401) {
    window.location.href = '/login'
    throw new Error('انتهت الجلسة')
  }
  const data = (await res.json().catch(() => ({}))) as {
    message?: string | string[]
  }
  if (!res.ok) {
    const message = Array.isArray(data.message) ? data.message[0] : data.message
    throw new Error(message ?? 'تعذر تنفيذ الطلب')
  }
  return data as T
}
