/**
 * API Services Index
 * Central export point for all API services
 */

// Core services
export { default as usersService } from './users.service';
export { default as agUsersService } from './ag-users.service';
export { default as chatsService } from './chats.service';
export { default as postsService } from './posts.service';
export { default as categoriesService } from './categories.service';
export { default as notificationsService } from './notifications.service';

// Re-export types
export * from '@/lib/api/types';
export { ApiResponse, PaginatedResponse, getErrorMessage } from '@/lib/api/client';

// Export API client for direct use if needed
export { default as apiClient } from '@/lib/api/client';
