import { ApiProperty } from '@nestjs/swagger';

export const PULSE_KINDS = [
  // Individual
  'requestOffers',
  'alertMatches',
  'providerStory',
  // Company
  'privateRequests',
  'billing',
  'offerAccepted',
  'publicRequests',
  // Individual and office
  'adExpiring',
  // Office
  'adCredits',
  // Company and office
  'myStory',
] as const;
export type PulseKind = (typeof PULSE_KINDS)[number];

export const PULSE_TONES = ['gold', 'amber', 'red'] as const;
export type PulseTone = (typeof PULSE_TONES)[number];

export class PulseItemDto {
  @ApiProperty({ enum: PULSE_KINDS })
  kind: PulseKind;

  @ApiProperty({
    description:
      'How many (offers, ads, matches, authors, requests, ad credits left); myStory: its views',
  })
  count: number;

  @ApiProperty({
    nullable: true,
    description:
      'Where a tap goes when the items share one target (the request, ad, alert or story author); null when several',
  })
  refId: string | null;

  @ApiProperty({
    required: false,
    description:
      'adExpiring: whole days until the soonest ad expires (0 = today); billing: days of the trial or plan left (absent when overdue or expired)',
  })
  daysLeft?: number;

  @ApiProperty({
    required: false,
    description: 'myStory: whole hours until the latest live story expires',
  })
  hoursLeft?: number;

  @ApiProperty({
    required: false,
    nullable: true,
    description: "providerStory: the first author's logo",
  })
  avatarUrl?: string | null;

  @ApiProperty({ enum: PULSE_TONES })
  tone: PulseTone;
}

export class PulseResponseDto {
  @ApiProperty({
    type: [PulseItemDto],
    description: 'Most pressing first; empty when nothing is going on',
  })
  items: PulseItemDto[];
}
