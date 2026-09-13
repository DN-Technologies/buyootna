import { Request, Response } from 'express';
import {
  createSwaggerAuthMiddleware,
  isSwaggerDocPath,
} from './swagger-auth.middleware';

describe('SwaggerAuthMiddleware', () => {
  describe('isSwaggerDocPath', () => {
    it('identifies docs paths accurately', () => {
      expect(isSwaggerDocPath('/docs')).toBe(true);
      expect(isSwaggerDocPath('/docs/')).toBe(true);
      expect(isSwaggerDocPath('/docs/swagger-ui.css')).toBe(true);
      expect(isSwaggerDocPath('/docs-json')).toBe(true);
      expect(isSwaggerDocPath('/docs-yaml')).toBe(true);
      expect(isSwaggerDocPath('/docs?filter=true')).toBe(true);

      expect(isSwaggerDocPath('/api/docs')).toBe(true);
      expect(isSwaggerDocPath('/api/docs/')).toBe(true);
      expect(isSwaggerDocPath('/api/docs-json')).toBe(true);
      expect(isSwaggerDocPath('/api/docs/swagger-ui.bundle.js')).toBe(true);
    });

    it('returns false for general API and application routes', () => {
      expect(isSwaggerDocPath('/api/users')).toBe(false);
      expect(isSwaggerDocPath('/properties')).toBe(false);
      expect(isSwaggerDocPath('/auth/login')).toBe(false);
      expect(isSwaggerDocPath('/health')).toBe(false);
      expect(isSwaggerDocPath('/')).toBe(false);
      expect(isSwaggerDocPath('/documents')).toBe(false);
    });
  });

  describe('createSwaggerAuthMiddleware execution', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let next: jest.Mock;
    let headersSent: Record<string, string>;

    beforeEach(() => {
      headersSent = {};
      mockRes = {
        setHeader: jest.fn((name: string, value: string) => {
          headersSent[name] = value;
          return mockRes as Response;
        }),
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      next = jest.fn();
    });

    it('bypasses non-swagger routes without checking auth', () => {
      mockReq = {
        originalUrl: '/api/users',
        headers: {},
      };

      const middleware = createSwaggerAuthMiddleware();
      middleware(mockReq as Request, mockRes as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('rejects unauthenticated requests to /docs with 401 and WWW-Authenticate', () => {
      mockReq = {
        originalUrl: '/docs',
        headers: {},
      };

      const middleware = createSwaggerAuthMiddleware();
      middleware(mockReq as Request, mockRes as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'WWW-Authenticate',
        expect.stringContaining('Basic realm='),
      );
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.stringContaining('Unauthorized'),
      );
    });

    it('rejects requests with non-Basic authorization schemes', () => {
      mockReq = {
        originalUrl: '/docs',
        headers: {
          authorization: 'Bearer some-jwt-token',
        },
      };

      const middleware = createSwaggerAuthMiddleware();
      middleware(mockReq as Request, mockRes as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('rejects requests with malformed credentials without colon', () => {
      const badCredentials = Buffer.from('onlyusername').toString('base64');
      mockReq = {
        originalUrl: '/docs',
        headers: {
          authorization: `Basic ${badCredentials}`,
        },
      };

      const middleware = createSwaggerAuthMiddleware();
      middleware(mockReq as Request, mockRes as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('rejects requests with incorrect credentials', () => {
      const wrongCredentials = Buffer.from('buyootna-qa:wrongpassword').toString('base64');
      mockReq = {
        originalUrl: '/docs',
        headers: {
          authorization: `Basic ${wrongCredentials}`,
        },
      };

      const middleware = createSwaggerAuthMiddleware();
      middleware(mockReq as Request, mockRes as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('accepts requests with valid default credentials and invokes next()', () => {
      const validCredentials = Buffer.from('buyootna-qa:BuyootnaQA2026!').toString('base64');
      mockReq = {
        originalUrl: '/docs',
        headers: {
          authorization: `Basic ${validCredentials}`,
        },
      };

      const middleware = createSwaggerAuthMiddleware();
      middleware(mockReq as Request, mockRes as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('accepts requests with custom options credentials', () => {
      const customCredentials = Buffer.from('qa-user:MySecret123').toString('base64');
      mockReq = {
        originalUrl: '/api/docs-json',
        headers: {
          authorization: `Basic ${customCredentials}`,
        },
      };

      const middleware = createSwaggerAuthMiddleware({
        user: 'qa-user',
        password: 'MySecret123',
      });
      middleware(mockReq as Request, mockRes as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});
