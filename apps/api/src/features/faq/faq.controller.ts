import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import { FaqItemDto } from './dto/faq-response.dto';

@ApiTags('FAQ')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @ApiOperation({ summary: 'List all active FAQ entries, ordered for display' })
  @ApiResponse({ status: 200, type: [FaqItemDto] })
  @ApiCommonErrors()
  async findAll() {
    return this.faqService.findAll();
  }
}
