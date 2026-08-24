import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { App } from 'supertest/types';

import { AppModule } from '../../src/app.module';
import { AppleAuthService } from '../../src/features/auth/services/apple-auth.service';
import { GoogleAuthService } from '../../src/features/auth/services/google-auth.service';

export interface MockGoogleAuthService {
  verifyIdToken: jest.Mock;
}

export interface MockAppleAuthService {
  verifyIdentityToken: jest.Mock;
}

export interface TestApp {
  app: INestApplication<App>;
  mockGoogleAuthService: MockGoogleAuthService;
  mockAppleAuthService: MockAppleAuthService;
}

/**
 * Boots a real Nest application against the real (containerized) test
 * database, mirroring main.ts's bootstrap — minus app.listen(), since
 * supertest talks to the underlying HTTP server directly via
 * app.getHttpServer(). Google/Apple token verification is the one
 * deliberate mock: it calls out to Apple/Google's live JWKS endpoints and
 * can't be exercised in an automated test run.
 */
export async function createTestApp(): Promise<TestApp> {
  const mockGoogleAuthService: MockGoogleAuthService = {
    verifyIdToken: jest.fn(),
  };
  const mockAppleAuthService: MockAppleAuthService = {
    verifyIdentityToken: jest.fn(),
  };

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(GoogleAuthService)
    .useValue(mockGoogleAuthService)
    .overrideProvider(AppleAuthService)
    .useValue(mockAppleAuthService)
    .compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors();
  await app.init();

  return { app, mockGoogleAuthService, mockAppleAuthService };
}
