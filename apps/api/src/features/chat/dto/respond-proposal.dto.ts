import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import type { ProposalAction } from '../services/chat-proposals.service';

export class RespondProposalDto {
  @ApiProperty({
    enum: ['accept', 'decline', 'cancel'],
    description: 'accept / decline (the other side) or cancel (the sender)',
  })
  @IsIn(['accept', 'decline', 'cancel'])
  action: ProposalAction;
}
