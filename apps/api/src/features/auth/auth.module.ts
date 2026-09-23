import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleAuthService } from './services/google-auth.service';
import { AppleAuthService } from './services/apple-auth.service';
import { AuthIdentitiesService } from './services/auth-identities.service';
import { AuthCredentialsService } from './services/auth-credentials.service';
import { AuthSessionService } from './services/auth-session.service';
import { AuthRegistrationService } from './services/auth-registration.service';
import { AuthPasswordService } from './services/auth-password.service';
import { UsersModule } from '../users/users.module';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-fallback-key',
      signOptions: { expiresIn: '7d' }, // Token valid for 7 days
    }),
    UsersModule,
    DevicesModule,
  ],
  providers: [
    AuthCredentialsService,
    AuthSessionService,
    AuthRegistrationService,
    AuthPasswordService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleAuthService,
    AppleAuthService,
    AuthIdentitiesService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
