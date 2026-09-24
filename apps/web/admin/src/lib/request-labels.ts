import { BackendRequestScope } from './admin-requests'

export const REQUEST_TYPE_LABEL: Record<BackendRequestScope, 'private' | 'public'> = {
  company: 'private',
  public: 'public',
}
