import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { SearchController } from 'src/features/search/search.controller';
import { SearchService } from 'src/features/search/search.service';

@Module({
  imports: [PrismaModule], // Inject Prisma to interact with the DB
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
