import { Module } from '@nestjs/common';
import { IdentitiesModule } from '../identities/identities.module';
import { CompanyIdentityController } from './company-identity.controller';

// CompanyController (the `/users`-prefixed company endpoints) is declared in
// UsersModule instead of here -- see the comment on UsersModule's
// `controllers` array for why (route-registration-order safety against
// UsersController's `GET /:id` catch-all). This module only owns the
// `/identities/company` route, which doesn't share a method+path with any
// catch-all, so it's safe on its own.
@Module({
  imports: [IdentitiesModule],
  controllers: [CompanyIdentityController],
})
export class CompanyModule {}
