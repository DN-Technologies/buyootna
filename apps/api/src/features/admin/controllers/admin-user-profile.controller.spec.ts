import type { RequestUser } from '../../auth/strategies/jwt.strategy';
import { AdminUserProfileController } from './admin-user-profile.controller';
import { setupAdminControllers } from './admin.controller.harness';

const ADMIN_REQ_USER = { userId: 'admin-1' } as RequestUser;

describe('AdminUserProfileController', () => {
  const harness = setupAdminControllers();
  let controller: AdminUserProfileController;
  let adminService: typeof harness.adminService;
  beforeEach(() => {
    controller = harness.get(AdminUserProfileController);
    adminService = harness.adminService;
  });

  it('getRequestsForUser should forward id to service', async () => {
    adminService.getRequestsForUser.mockResolvedValue([]);
    await controller.getRequestsForUser('u-1');
    expect(adminService.getRequestsForUser).toHaveBeenCalledWith('u-1');
  });

  it('getProjectsForUser should forward id to service', async () => {
    adminService.getProjectsForUser.mockResolvedValue([]);
    await controller.getProjectsForUser('u-1');
    expect(adminService.getProjectsForUser).toHaveBeenCalledWith('u-1');
  });

  it('deleteProject should forward id and adminUserId to service', async () => {
    adminService.deleteProject.mockResolvedValue({ message: 'تم الحذف' });
    await controller.deleteProject(ADMIN_REQ_USER, 'project-1');
    expect(adminService.deleteProject).toHaveBeenCalledWith(
      'project-1',
      'admin-1',
    );
  });

  it('getReviewsForUser should forward id and query to service', async () => {
    adminService.getReviewsForUser.mockResolvedValue({ data: [] });
    const query = { page: '1' };
    await controller.getReviewsForUser('u-1', query);
    expect(adminService.getReviewsForUser).toHaveBeenCalledWith('u-1', query);
  });

  it('getReviewsSummaryForUser should forward id to service', async () => {
    adminService.getReviewsSummaryForUser.mockResolvedValue({
      averageRating: 0,
    });
    await controller.getReviewsSummaryForUser('u-1');
    expect(adminService.getReviewsSummaryForUser).toHaveBeenCalledWith('u-1');
  });

  it('deleteReview should forward id to service', async () => {
    adminService.deleteReview.mockResolvedValue({ message: 'تم الحذف' });
    await controller.deleteReview('review-1');
    expect(adminService.deleteReview).toHaveBeenCalledWith('review-1');
  });

  it('getNotesForUser should forward id to service', async () => {
    adminService.getNotesForUser.mockResolvedValue([]);
    await controller.getNotesForUser('u-1');
    expect(adminService.getNotesForUser).toHaveBeenCalledWith('u-1');
  });

  it('createNote should forward id, dto and adminUserId to service', async () => {
    adminService.createNote.mockResolvedValue({ id: 'note-1' });
    const dto = { content: 'نص' };
    await controller.createNote(ADMIN_REQ_USER, 'u-1', dto);
    expect(adminService.createNote).toHaveBeenCalledWith('u-1', dto, 'admin-1');
  });

  it('updateNote should forward id and dto to service', async () => {
    adminService.updateNote.mockResolvedValue({ id: 'note-1' });
    const dto = { content: 'نص جديد' };
    await controller.updateNote('note-1', dto);
    expect(adminService.updateNote).toHaveBeenCalledWith('note-1', dto);
  });

  it('deleteNote should forward id to service', async () => {
    adminService.deleteNote.mockResolvedValue({ message: 'تم الحذف' });
    await controller.deleteNote('note-1');
    expect(adminService.deleteNote).toHaveBeenCalledWith('note-1');
  });

  it('getLogsForUser should forward id and parsed pagination to service', async () => {
    adminService.getLogsForUser.mockResolvedValue({ data: [] });
    await controller.getLogsForUser('u-1', '2', '5');
    expect(adminService.getLogsForUser).toHaveBeenCalledWith('u-1', 2, 5);
  });

  it('getLogsForUser should pass undefined pagination when not provided', async () => {
    adminService.getLogsForUser.mockResolvedValue({ data: [] });
    await controller.getLogsForUser('u-1');
    expect(adminService.getLogsForUser).toHaveBeenCalledWith(
      'u-1',
      undefined,
      undefined,
    );
  });
});
