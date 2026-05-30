import { Controller, Get, Query } from '@nestjs/common';
import { GetSearchFilterDto } from 'src/features/search/dto/get-search-filter.dto';
import { SearchService } from 'src/features/search/search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

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
