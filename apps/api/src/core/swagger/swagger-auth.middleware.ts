import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

export interface SwaggerAuthOptions {
  user?: string;
  password?: string;
  realm?: string;
}

/**
 * Determines whether a given request path targets the Swagger documentation UI,
 * assets, or OpenAPI specifications.
 */
export function isSwaggerDocPath(path: string): boolean {
  const normalized = (path || '').split('?')[0];
  return (
    normalized === '/docs' ||
    normalized.startsWith('/docs/') ||
    normalized.startsWith('/docs-') ||
    normalized === '/api/docs' ||
    normalized.startsWith('/api/docs/') ||
    normalized.startsWith('/api/docs-')
  );
}

/**
 * Creates an Express middleware that protects Swagger endpoints with HTTP Basic Authentication.
 * Requests to non-docs endpoints pass through transparently.
 */
export function createSwaggerAuthMiddleware(options?: SwaggerAuthOptions) {
  const expectedUser =
    options?.user ?? process.env.SWAGGER_USER ?? 'buyootna-qa';
  const expectedPass =
    options?.password ?? process.env.SWAGGER_PASSWORD ?? 'BuyootnaQA2026!';
  const realm = options?.realm ?? 'Buyootna API Documentation';

  return (req: Request, res: Response, next: NextFunction): void => {
    const url = req.originalUrl || req.url || '';
    if (!isSwaggerDocPath(url)) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.setHeader(
        'WWW-Authenticate',
        `Basic realm="${realm}", charset="UTF-8"`,
      );
      res.status(401).send('Unauthorized: Documentation credentials required.');
      return;
    }

    let credentials = '';
    try {
      credentials = Buffer.from(authHeader.slice(6).trim(), 'base64').toString(
        'utf-8',
      );
    } catch {
      res.setHeader(
        'WWW-Authenticate',
        `Basic realm="${realm}", charset="UTF-8"`,
      );
      res.status(401).send('Unauthorized: Malformed credentials.');
      return;
    }

    const colonIndex = credentials.indexOf(':');
    if (colonIndex === -1) {
      res.setHeader(
        'WWW-Authenticate',
        `Basic realm="${realm}", charset="UTF-8"`,
      );
      res.status(401).send('Unauthorized: Invalid credentials format.');
      return;
    }

    const user = credentials.substring(0, colonIndex);
    const pass = credentials.substring(colonIndex + 1);

    const userBuffer = Buffer.from(user, 'utf-8');
    const expectedUserBuffer = Buffer.from(expectedUser, 'utf-8');
    const passBuffer = Buffer.from(pass, 'utf-8');
    const expectedPassBuffer = Buffer.from(expectedPass, 'utf-8');

    const userMatch =
      userBuffer.length === expectedUserBuffer.length &&
      crypto.timingSafeEqual(userBuffer, expectedUserBuffer);

    const passMatch =
      passBuffer.length === expectedPassBuffer.length &&
      crypto.timingSafeEqual(passBuffer, expectedPassBuffer);

    if (!userMatch || !passMatch) {
      res.setHeader(
        'WWW-Authenticate',
        `Basic realm="${realm}", charset="UTF-8"`,
      );
      res.status(401).send('Unauthorized: Incorrect username or password.');
      return;
    }

    return next();
  };
}
