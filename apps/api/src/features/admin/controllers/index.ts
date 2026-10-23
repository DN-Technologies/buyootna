import { AdminBillingController } from './admin-billing.controller';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminModerationController } from './admin-moderation.controller';
import { AdminUserProfileController } from './admin-user-profile.controller';
import { AdminUsersController } from './admin-users.controller';

export {
  AdminBillingController,
  AdminDashboardController,
  AdminModerationController,
  AdminUserProfileController,
  AdminUsersController,
};

/**
 * The /admin controllers, in routing order: Nest matches routes in the order
 * controllers are registered, so the dashboard's GET /admin/users/export has
 * to come before the users' GET /admin/users/:id.
 */
export const ADMIN_CONTROLLERS = [
  AdminDashboardController,
  AdminModerationController,
  AdminUsersController,
  AdminUserProfileController,
  AdminBillingController,
];
