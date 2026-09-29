import { DocsRole } from '@prisma/client';

export const DOCS_ROLES_KEY = 'docsRoles';

export const DOCS_PASSWORD_MIN_LENGTH = 10;

/** Who is signed in to the docs portal (from the docs token). */
export interface DocsUser {
  role: DocsRole;
  name: string;
}

export interface DocsTokenPayload extends DocsUser {
  // Marks the token as a docs-portal token; app tokens never carry it
  kind: 'docs';
  // When the role's password was set: rotating it signs everyone out
  ver: number;
}
