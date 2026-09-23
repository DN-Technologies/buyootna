import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: {
    review: { findUnique: jest.Mock; delete: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      review: {
        findUnique: jest.fn().mockResolvedValue({ id: 'review-1' }),
        delete: jest.fn().mockResolvedValue({ id: 'review-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('adminDeleteReview', () => {
    it('throws NotFoundException when the review does not exist', async () => {
      prisma.review.findUnique.mockResolvedValue(null);
      await expect(service.adminDeleteReview('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes the review with no ownership check', async () => {
      const result = await service.adminDeleteReview('review-1');

      expect(prisma.review.delete).toHaveBeenCalledWith({
        where: { id: 'review-1' },
      });
      expect(result).toEqual({ message: 'تم حذف التقييم بنجاح' });
    });
  });
});
