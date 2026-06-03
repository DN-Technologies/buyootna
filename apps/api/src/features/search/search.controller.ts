import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { AdvancedSearchDto } from 'src/features/search/dto/advanced-search.dto';
import { GetSearchFilterDto } from 'src/features/search/dto/get-search-filter.dto';
import { SearchService } from 'src/features/search/search.service';
import { mapToFrontendCard } from 'src/features/search/utils/search-mapper.util';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * POST /search/advanced
   * Consumes the complex polymorphic payload
   */
  @Post('advanced')
  @HttpCode(HttpStatus.OK) // Return 200 OK instead of the default 201 Created for POST
  async executeAdvancedSearch(@Body() payload: AdvancedSearchDto) {
    // 1. Pass the validated DTO to the routing service (which hits the Prisma Strategies)
    const rawResult = await this.searchService.globalAdvancedSearch(payload);

    // 2. Map the raw database entities into the unified frontend format
    const formattedData = rawResult.data.map((item) =>
      mapToFrontendCard(item, payload.tab),
    );

    // 3. Return the seamlessly formatted payload with pagination metadata
    return {
      data: formattedData,
      meta: rawResult.meta,
    };
  }

  /**
   * GET /search
   * Unified endpoint for searching Properties, Companies, Auctions, and Deals.
   * Publicly accessible.
   */
  @Get()
  async globalSearch(@Query() filters: GetSearchFilterDto) {
    // The validation pipe automatically checks the DTO and converts types (e.g., page string to number)
    return this.searchService.globalSearch(filters);
  }
}
