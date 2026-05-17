import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Tell Passport to. expect 'identifier' instead of the default 'username' field
    super({
      usernameField: 'identifier',
    });
  }

  async validate(
    identifier: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.authService.validateUser(identifier, password);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user; // This user object gets attached to the Express Request
  }
}
