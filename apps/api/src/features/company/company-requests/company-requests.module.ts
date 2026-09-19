import { Module } from '@nestjs/common';
import { CompanyRequestsController } from './company-requests.controller';
import { CompanyRequestsService } from './company-requests.service';

@Module({
  controllers: [CompanyRequestsController],
  providers: [CompanyRequestsService],
  exports: [CompanyRequestsService],
})
export class CompanyRequestsModule {}
