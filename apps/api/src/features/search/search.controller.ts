import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { AdvancedSearchDto, FilterTab } from 'src/features/search/dto/advanced-search.dto';
import {
  StandardFilterDto,
  ExchangeFilterDto,
  CompanyFilterDto,
  AuctionFilterDto,
  DealFilterDto,
} from 'src/features/search/dto/advanced-filters.dto';
import { GetSearchFilterDto } from 'src/features/search/dto/get-search-filter.dto';
import { SearchService } from 'src/features/search/search.service';
import { mapToFrontendCard } from 'src/features/search/utils/search-mapper.util';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import {
  AdvancedSearchResponseDto,
  GlobalSearchResponseDto,
} from './dto/search-response.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * POST /search/advanced
   * Consumes the complex polymorphic payload
   */
  @Post('advanced')
  @HttpCode(HttpStatus.OK) // Return 200 OK instead of the default 201 Created for POST
  @ApiOperation({
    summary:
      'Run an advanced search. The "filters" shape depends on "tab": sell/rent use StandardFilterDto, exchange uses ExchangeFilterDto, companies uses CompanyFilterDto, auctions uses AuctionFilterDto, deals uses DealFilterDto.',
  })
  @ApiExtraModels(
    StandardFilterDto,
    ExchangeFilterDto,
    CompanyFilterDto,
    AuctionFilterDto,
    DealFilterDto,
  )
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tab', 'filters'],
      properties: {
        tab: { type: 'string', enum: Object.values(FilterTab) },
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, default: 10 },
        filters: {
          oneOf: [
            { $ref: getSchemaPath(StandardFilterDto) },
            { $ref: getSchemaPath(ExchangeFilterDto) },
            { $ref: getSchemaPath(CompanyFilterDto) },
            { $ref: getSchemaPath(AuctionFilterDto) },
            { $ref: getSchemaPath(DealFilterDto) },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 200, type: AdvancedSearchResponseDto })
  @ApiCommonErrors()
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
  @ApiOperation({ summary: 'Unified search across properties, companies, auctions, and deals' })
  @ApiQuery({ type: GetSearchFilterDto })
  @ApiResponse({ status: 200, type: GlobalSearchResponseDto })
  @ApiCommonErrors()
  async globalSearch(@Query() filters: GetSearchFilterDto) {
    // The validation pipe automatically checks the DTO and converts types (e.g., page string to number)
    return this.searchService.globalSearch(filters);
  }
}
