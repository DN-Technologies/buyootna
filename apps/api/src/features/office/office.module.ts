import { Module } from '@nestjs/common';
import { IdentitiesModule } from '../identities/identities.module';
import { OfficeIdentityController } from './office-identity.controller';
import { OfficesController } from './offices.controller';
import { OfficesService } from './offices.service';

// OfficeController (the `/users`-prefixed office endpoints) is declared in
// UsersModule instead of here -- see the comment on UsersModule's
// `controllers` array for why (route-registration-order safety against
// UsersController's `GET /:id` catch-all). This module only owns the
// `/identities/office` route and the `/offices/*` routes, which don't share
// a method+path with any catch-all, so they're safe on their own.
@Module({
  imports: [IdentitiesModule],
  controllers: [OfficeIdentityController, OfficesController],
  providers: [OfficesService],
})
export class OfficeModule {}
