import type { AdminService } from './admin.service';
import { setupAdminService } from './admin.service.harness';

describe("AdminService facade: a user's requests, projects, ratings, notes and logs", () => {
  const harness = setupAdminService();
  const {
    adminRequestsService,
    adminExhibitionService,
    adminRatingsService,
    adminNotesService,
    adminAuditLogService,
  } = harness;
  let service: AdminService;
  beforeEach(() => {
    service = harness.service;
  });

  it('delegates getRequestsForUser to AdminRequestsService', async () => {
    const mockResult: any[] = [];
    adminRequestsService.getRequestsForUser.mockResolvedValue(mockResult);

    const result = await service.getRequestsForUser('u-1');

    expect(adminRequestsService.getRequestsForUser).toHaveBeenCalledWith('u-1');
    expect(result).toBe(mockResult);
  });

  it('delegates getProjectsForUser to AdminExhibitionService', async () => {
    const mockResult: any[] = [];
    adminExhibitionService.getProjectsForUser.mockResolvedValue(mockResult);

    const result = await service.getProjectsForUser('u-1');

    expect(adminExhibitionService.getProjectsForUser).toHaveBeenCalledWith(
      'u-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates deleteProject to AdminExhibitionService', async () => {
    const mockResult = { message: 'تم الحذف' };
    adminExhibitionService.deleteProject.mockResolvedValue(mockResult);

    const result = await service.deleteProject('project-1', 'admin-1');

    expect(adminExhibitionService.deleteProject).toHaveBeenCalledWith(
      'project-1',
      'admin-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates getReviewsForUser to AdminRatingsService', async () => {
    const mockResult = { data: [] };
    adminRatingsService.getReviewsForUser.mockResolvedValue(mockResult);
    const query = { page: '1' };

    const result = await service.getReviewsForUser('u-1', query);

    expect(adminRatingsService.getReviewsForUser).toHaveBeenCalledWith(
      'u-1',
      query,
    );
    expect(result).toBe(mockResult);
  });

  it('delegates getReviewsSummaryForUser to AdminRatingsService', async () => {
    const mockResult = { averageRating: 4.5 };
    adminRatingsService.getSummaryForUser.mockResolvedValue(mockResult);

    const result = await service.getReviewsSummaryForUser('u-1');

    expect(adminRatingsService.getSummaryForUser).toHaveBeenCalledWith('u-1');
    expect(result).toBe(mockResult);
  });

  it('delegates deleteReview to AdminRatingsService', async () => {
    const mockResult = { message: 'تم حذف التقييم بنجاح' };
    adminRatingsService.deleteReview.mockResolvedValue(mockResult);

    const result = await service.deleteReview('review-1');

    expect(adminRatingsService.deleteReview).toHaveBeenCalledWith('review-1');
    expect(result).toBe(mockResult);
  });

  it('delegates getNotesForUser to AdminNotesService', async () => {
    const mockResult: any[] = [];
    adminNotesService.getNotesForUser.mockResolvedValue(mockResult);

    const result = await service.getNotesForUser('u-1');

    expect(adminNotesService.getNotesForUser).toHaveBeenCalledWith('u-1');
    expect(result).toBe(mockResult);
  });

  it('delegates createNote to AdminNotesService', async () => {
    const dto = { content: 'نص' };
    const mockResult = { id: 'note-1' };
    adminNotesService.createNote.mockResolvedValue(mockResult);

    const result = await service.createNote('u-1', dto, 'admin-1');

    expect(adminNotesService.createNote).toHaveBeenCalledWith(
      'u-1',
      dto,
      'admin-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates updateNote to AdminNotesService', async () => {
    const dto = { content: 'نص جديد' };
    const mockResult = { id: 'note-1' };
    adminNotesService.updateNote.mockResolvedValue(mockResult);

    const result = await service.updateNote('note-1', dto);

    expect(adminNotesService.updateNote).toHaveBeenCalledWith('note-1', dto);
    expect(result).toBe(mockResult);
  });

  it('delegates deleteNote to AdminNotesService', async () => {
    const mockResult = { message: 'تم حذف الملاحظة بنجاح' };
    adminNotesService.deleteNote.mockResolvedValue(mockResult);

    const result = await service.deleteNote('note-1');

    expect(adminNotesService.deleteNote).toHaveBeenCalledWith('note-1');
    expect(result).toBe(mockResult);
  });

  it('delegates getLogsForUser to AdminAuditLogService', async () => {
    const mockResult = { data: [], meta: { total: 0 } };
    adminAuditLogService.getLogsForUser.mockResolvedValue(mockResult);

    const result = await service.getLogsForUser('u-1', 2, 5);

    expect(adminAuditLogService.getLogsForUser).toHaveBeenCalledWith(
      'u-1',
      2,
      5,
    );
    expect(result).toBe(mockResult);
  });
});
