import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  OfferPeriod,
  Prisma,
  ProposalKind,
  ProposalStatus,
} from '@prisma/client';

import { PrismaService } from 'src/core/prisma/prisma.service';

import { formatKuwaitDateTime, proposalDetail } from './chat-proposal-format';
import { ChatPushService, propertyTitle } from './chat-push.service';

// Appointments: from a few minutes ahead up to this far
const APPOINTMENT_MAX_DAYS = 90;
const APPOINTMENT_MIN_LEAD_MS = 5 * 60 * 1000;
// Accepted appointments get a push this long before
const REMINDER_WINDOW_MS = 60 * 60 * 1000;
const NOTE_MAX_CHARS = 500;
const OFFER_MAX_AMOUNT = 1_000_000_000;

export const PROPOSAL_SELECT = {
  id: true,
  kind: true,
  status: true,
  scheduledAt: true,
  amount: true,
  currency: true,
  period: true,
  note: true,
  counterOfId: true,
  respondedAt: true,
} as const;

type ProposalRow = Prisma.ChatProposalGetPayload<{
  select: typeof PROPOSAL_SELECT;
}>;

export type ProposalAction = 'accept' | 'decline' | 'cancel';

/** What the app gets: the amount as a plain number. */
export function presentProposal(p: ProposalRow) {
  return { ...p, amount: p.amount == null ? null : Number(p.amount) };
}

export interface ProposalInput {
  scheduledAt?: string;
  amount?: number;
  period?: OfferPeriod;
  note?: string;
  counterOfId?: string;
}

interface ParsedProposal {
  kind: ProposalKind;
  scheduledAt: Date | null;
  amount: number | null;
  period: OfferPeriod | null;
  note: string | null;
  counterOfId: string | null;
}

/**
 * Viewing appointments (موعد معاينة) and price offers (عرض سعر): created
 * with their message, answered by the other participant (accept / decline,
 * or a counter as a new proposal), cancelled by the sender while pending,
 * and a push one hour before an accepted appointment.
 */
@Injectable()
export class ChatProposalsService {
  private readonly logger = new Logger(ChatProposalsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatPush: ChatPushService,
  ) {}

  /**
   * Checks a proposal sent over the socket (the gateway doesn't run the
   * validation pipe, so the rules live here).
   */
  parse(
    kind: ProposalKind,
    input: ProposalInput | undefined,
    now = new Date(),
  ): ParsedProposal {
    if (!input) throw new BadRequestException('بيانات العرض مطلوبة');
    const note = input.note?.trim() || null;
    if (note && note.length > NOTE_MAX_CHARS) {
      throw new BadRequestException('الملاحظة طويلة جداً');
    }
    const base = { kind, note, counterOfId: input.counterOfId || null };

    if (kind === 'APPOINTMENT') {
      const at = input.scheduledAt ? new Date(input.scheduledAt) : null;
      if (!at || Number.isNaN(at.getTime())) {
        throw new BadRequestException('يرجى اختيار موعد صحيح');
      }
      const lead = at.getTime() - now.getTime();
      if (lead < APPOINTMENT_MIN_LEAD_MS) {
        throw new BadRequestException('يرجى اختيار موعد في المستقبل');
      }
      if (lead > APPOINTMENT_MAX_DAYS * 24 * 60 * 60 * 1000) {
        throw new BadRequestException(
          `يمكن تحديد موعد خلال ${APPOINTMENT_MAX_DAYS} يوماً فقط`,
        );
      }
      return { ...base, scheduledAt: at, amount: null, period: null };
    }

    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > OFFER_MAX_AMOUNT) {
      throw new BadRequestException('يرجى إدخال مبلغ صحيح');
    }
    const period = input.period ?? 'TOTAL';
    if (!Object.values(OfferPeriod).includes(period)) {
      throw new BadRequestException('مدة العرض غير صحيحة');
    }
    return {
      ...base,
      scheduledAt: null,
      amount: Math.round(amount * 1000) / 1000,
      period,
    };
  }

  /**
   * Creates the proposal for a just-created message. A counter marks the
   * proposal it answers as COUNTERED; that one must be pending, of the same
   * kind, in this conversation, and sent by the other side.
   */
  async createFor(
    tx: Prisma.TransactionClient,
    params: {
      identityId: string;
      conversationId: string;
      messageId: string;
      proposal: ParsedProposal;
    },
  ) {
    const { identityId, conversationId, messageId, proposal } = params;
    let countered: { messageId: string; proposal: ProposalRow } | null = null;

    if (proposal.counterOfId) {
      const original = await tx.chatProposal.findUnique({
        where: { id: proposal.counterOfId },
        include: {
          message: { select: { conversationId: true, senderIdentityId: true } },
        },
      });
      if (
        !original ||
        original.message.conversationId !== conversationId ||
        original.kind !== proposal.kind ||
        original.message.senderIdentityId === identityId
      ) {
        throw new BadRequestException('لا يمكن الرد على هذا العرض');
      }
      const { count } = await tx.chatProposal.updateMany({
        where: { id: original.id, status: 'PENDING' },
        data: {
          status: 'COUNTERED',
          respondedById: identityId,
          respondedAt: new Date(),
        },
      });
      if (!count) {
        throw new BadRequestException('تم الرد على هذا العرض مسبقاً');
      }
      countered = {
        messageId: original.messageId,
        proposal: await tx.chatProposal.findUniqueOrThrow({
          where: { id: original.id },
          select: PROPOSAL_SELECT,
        }),
      };
    }

    const created = await tx.chatProposal.create({
      data: {
        messageId,
        kind: proposal.kind,
        scheduledAt: proposal.scheduledAt,
        amount: proposal.amount,
        period: proposal.period,
        note: proposal.note,
        counterOfId: proposal.counterOfId,
      },
      select: PROPOSAL_SELECT,
    });
    return { proposal: created, countered };
  }

  /** قبول / رفض by the other side, إلغاء by the sender; pending only. */
  async respond(
    identityId: string,
    proposalId: string,
    action: ProposalAction,
    now = new Date(),
  ) {
    const proposal = await this.prisma.chatProposal.findUnique({
      where: { id: proposalId },
      include: {
        message: { select: { conversationId: true, senderIdentityId: true } },
      },
    });
    const participant =
      proposal &&
      (await this.prisma.conversationParticipant.findFirst({
        where: { conversationId: proposal.message.conversationId, identityId },
        select: { id: true },
      }));
    if (!proposal || !participant) {
      throw new NotFoundException('العرض غير موجود');
    }

    const isSender = proposal.message.senderIdentityId === identityId;
    if (action === 'cancel' && !isSender) {
      throw new ForbiddenException('يمكن للمرسل فقط إلغاء العرض');
    }
    if (action !== 'cancel' && isSender) {
      throw new ForbiddenException('لا يمكنك الرد على عرضك');
    }
    if (proposal.status !== 'PENDING') {
      throw new BadRequestException('تم الرد على هذا العرض مسبقاً');
    }
    if (
      action === 'accept' &&
      proposal.kind === 'APPOINTMENT' &&
      proposal.scheduledAt &&
      proposal.scheduledAt <= now
    ) {
      throw new BadRequestException('انتهى وقت هذا الموعد');
    }

    const status: ProposalStatus =
      action === 'accept'
        ? 'ACCEPTED'
        : action === 'decline'
          ? 'DECLINED'
          : 'CANCELLED';
    // Pending only, even if the other side answered a moment ago
    const { count } = await this.prisma.chatProposal.updateMany({
      where: { id: proposalId, status: 'PENDING' },
      data: { status, respondedById: identityId, respondedAt: now },
    });
    if (!count) {
      throw new BadRequestException('تم الرد على هذا العرض مسبقاً');
    }

    const updated = await this.prisma.chatProposal.findUniqueOrThrow({
      where: { id: proposalId },
      select: PROPOSAL_SELECT,
    });

    // Tell the other side (best effort)
    const otherIds = (
      await this.prisma.conversationParticipant.findMany({
        where: {
          conversationId: proposal.message.conversationId,
          identityId: { not: identityId },
        },
        select: { identityId: true },
      })
    ).map((p) => p.identityId);
    const what =
      proposal.kind === 'APPOINTMENT' ? 'موعد المعاينة' : 'عرض السعر';
    const verb =
      status === 'ACCEPTED' ? 'قبل' : status === 'DECLINED' ? 'رفض' : 'ألغى';
    void this.chatPush.notifyIdentities(otherIds, {
      conversationId: proposal.message.conversationId,
      fromIdentityId: identityId,
      body: `${verb} ${what}: ${proposalDetail(updated)}`,
    });

    return {
      conversationId: proposal.message.conversationId,
      messageId: proposal.messageId,
      proposal: presentProposal(updated),
    };
  }

  /**
   * A push to both people before an accepted appointment (within the hour).
   * Each appointment is reminded once: `remindedAt` is claimed first.
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async sendReminders(now = new Date()): Promise<number> {
    const due = await this.prisma.chatProposal.findMany({
      where: {
        kind: 'APPOINTMENT',
        status: 'ACCEPTED',
        remindedAt: null,
        scheduledAt: {
          gt: now,
          lte: new Date(now.getTime() + REMINDER_WINDOW_MS),
        },
      },
      select: {
        id: true,
        scheduledAt: true,
        message: {
          select: {
            conversationId: true,
            conversation: {
              select: {
                participants: { select: { identityId: true } },
                property: { select: { category: true, type: true } },
              },
            },
          },
        },
      },
    });

    let sent = 0;
    for (const appointment of due) {
      const { count } = await this.prisma.chatProposal.updateMany({
        where: { id: appointment.id, remindedAt: null },
        data: { remindedAt: now },
      });
      if (!count) continue;
      sent += 1;
      const { conversation, conversationId } = appointment.message;
      const title = propertyTitle(conversation.property);
      await this.chatPush.notifyIdentities(
        conversation.participants.map((p) => p.identityId),
        {
          conversationId,
          title: 'تذكير بموعد المعاينة',
          body: `${formatKuwaitDateTime(appointment.scheduledAt!)}${title ? ` · ${title}` : ''}`,
        },
      );
    }
    if (sent) this.logger.log(`Sent ${sent} appointment reminder(s)`);
    return sent;
  }
}
