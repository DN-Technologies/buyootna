import { Controller, Get } from '@nestjs/common';
import { FaqService } from './faq.service';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  async findAll() {
    return this.faqService.findAll();
  }
}
