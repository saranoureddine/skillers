import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
  ApiConsumes,
} from '@nestjs/swagger';
import {
  GetCategoriesDto,
  GetCategoryDto,
  ToggleTopSubcategoryDto,
  GetTopSubcategoriesDto,
  UploadCategoryImageDto,
  GetHierarchicalCategoriesDto,
} from '../dto';
import {
  ApiItemResponse,
  ApiErrorResponses,
} from '../../../common/swagger';

// ============================================================================
// Public ProfCategories Controller Documentation
// ============================================================================

export const ProfCategoriesPublicControllerDocs = {
  /**
   * Controller-level decorators for public prof categories controller
   */
  controller: () =>
    applyDecorators(
      ApiTags('Prof Categories'),
      ApiBearerAuth('Token-auth'),
    ),

  /**
   * POST /api/public/prof-categories/get-categories - Get all categories with subcategories
   */
  getCategories: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all categories with subcategories',
        description: 'Retrieve all active profession categories with their subcategories, including location-based worker counts. Supports pagination and optional web interface mode.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetCategoriesDto }),
      ApiResponse({
        status: 200,
        description: 'Categories retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                categories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 1 },
                      name: { type: 'string', example: 'Medical' },
                      description: { type: 'string', example: 'Medical professionals and services' },
                      sort_order: { type: 'number', example: 1 },
                      icon_attachment_id: { type: 'number', nullable: true },
                      is_active: { type: 'number', example: 1 },
                      icon_url: { type: 'string', nullable: true, example: 'http://localhost/uploads/categories/icon.jpg' },
                      subcategories: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'number', example: 5 },
                            name: { type: 'string', example: 'Cardiologist' },
                            description: { type: 'string', example: 'Heart specialist' },
                            sort_order: { type: 'number', example: 1 },
                            icon_url: { type: 'string', nullable: true },
                            worker_count: { type: 'number', example: 25 },
                          },
                        },
                      },
                    },
                  },
                },
                cities: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 1 },
                      city_name: { type: 'string', example: 'Beirut' },
                      province: { type: 'string', example: 'Beirut' },
                    },
                  },
                },
                total_categories: { type: 'number', example: 10 },
                returned_categories: { type: 'number', example: 10 },
                total_subcategories: { type: 'number', example: 50 },
                total_cities: { type: 'number', example: 20 },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                current_page: { type: 'number', example: 1 },
                per_page: { type: 'number', example: 10 },
                total_count: { type: 'number', example: 10 },
                total_pages: { type: 'number', example: 1 },
                has_next_page: { type: 'boolean', example: false },
                has_prev_page: { type: 'boolean', example: false },
                next_page: { type: 'number', nullable: true, example: null },
                prev_page: { type: 'number', nullable: true, example: null },
              },
            },
            metadata: {
              type: 'object',
              properties: {
                language: { type: 'string', example: 'en' },
                retrieved_at: { type: 'string', example: '2026-02-24T12:00:00.000Z' },
                api_version: { type: 'string', example: '2.0.0' },
                includes_subcategories: { type: 'boolean', example: true },
                is_web: { type: 'boolean', example: false },
                active_filter: { type: 'string', example: 'active_only' },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-categories/get-category - Get single category with subcategories
   */
  getCategory: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get single category',
        description: 'Retrieve a single category with all its subcategories and professions.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetCategoryDto }),
      ApiResponse({
        status: 200,
        description: 'Category retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                category: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 1 },
                    name: { type: 'string', example: 'Medical' },
                    description: { type: 'string', example: 'Medical professionals' },
                    icon_url: { type: 'string', nullable: true },
                    subcategories: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'number', example: 5 },
                          name: { type: 'string', example: 'Cardiologist' },
                        },
                      },
                    },
                    professions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'number', example: 5 },
                          name: { type: 'string', example: 'Cardiologist' },
                        },
                      },
                    },
                    is_parent: { type: 'number', example: 1 },
                  },
                },
                statistics: {
                  type: 'object',
                  properties: {
                    subcategories_count: { type: 'number', example: 10 },
                    professions_count: { type: 'number', example: 10 },
                  },
                },
              },
            },
            metadata: {
              type: 'object',
              properties: {
                language: { type: 'string', example: 'en' },
                retrieved_at: { type: 'string', example: '2026-02-24T12:00:00.000Z' },
                api_version: { type: 'string', example: '2.0.0' },
                includes_subcategories: { type: 'boolean', example: true },
                includes_professions: { type: 'boolean', example: true },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/prof-categories/toggle-top-subcategory - Toggle top subcategory flag
   */
  toggleTopSubcategory: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Toggle top subcategory',
        description: 'Mark or unmark a subcategory as top (featured).',
      }),
      ApiBody({ type: ToggleTopSubcategoryDto }),
      ApiResponse({
        status: 200,
        description: 'Subcategory updated successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Subcategory marked as top' },
            data: {
              type: 'object',
              properties: {
                subcategory_id: { type: 'number', example: 5 },
                is_top: { type: 'number', example: 1 },
                updated_at: { type: 'string', example: '2026-02-24T12:00:00.000Z' },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/prof-categories/get-top-subcategories - Get top subcategories
   */
  getTopSubcategories: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get top subcategories',
        description: 'Retrieve all subcategories marked as top (featured), with location-based worker counts.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetTopSubcategoriesDto }),
      ApiResponse({
        status: 200,
        description: 'Top subcategories retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                top_subcategories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 5 },
                      name: { type: 'string', example: 'Cardiologist' },
                      description: { type: 'string', example: 'Heart specialist' },
                      icon_url: { type: 'string', nullable: true },
                      is_top: { type: 'number', example: 1 },
                      parent_id: { type: 'number', example: 1 },
                      worker_count: { type: 'number', example: 25 },
                    },
                  },
                },
                total_count: { type: 'number', example: 10 },
              },
            },
            metadata: {
              type: 'object',
              properties: {
                language: { type: 'string', example: 'en' },
                retrieved_at: { type: 'string', example: '2026-02-24T12:00:00.000Z' },
                api_version: { type: 'string', example: '2.0.0' },
              },
            },
          },
        },
      }),
      ApiErrorResponses(401, 500),
    ),

  /**
   * POST /api/public/prof-categories/upload-category-image - Upload category image
   */
  uploadCategoryImage: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Upload category image',
        description: 'Upload an image for a category or subcategory.',
      }),
      ApiConsumes('multipart/form-data'),
      ApiBody({ type: UploadCategoryImageDto }),
      ApiResponse({
        status: 200,
        description: 'Image uploaded successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Image uploaded successfully' },
            data: {
              type: 'object',
              properties: {
                category_id: { type: 'number', example: 1 },
                image_url: { type: 'string', example: 'http://localhost/uploads/categories/category_category_1_1234567890.jpg' },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),

  /**
   * POST /api/public/prof-categories/get-hierarchical-categories - Get hierarchical category structure
   */
  getHierarchicalCategories: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get hierarchical categories',
        description: 'Retrieve a category with all its nested subcategories in a hierarchical structure.',
      }),
      ApiHeader({
        name: 'Language',
        required: false,
        description: 'Language code (e.g., "en", "ar")',
        enum: ['en', 'ar'],
      }),
      ApiBody({ type: GetHierarchicalCategoriesDto }),
      ApiResponse({
        status: 200,
        description: 'Hierarchical categories retrieved successfully',
        schema: {
          properties: {
            succeeded: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                category: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 1 },
                    name: { type: 'string', example: 'Medical' },
                    description: { type: 'string', example: 'Medical professionals' },
                    icon_url: { type: 'string', nullable: true },
                    subcategories: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'number', example: 5 },
                          name: { type: 'string', example: 'Cardiologist' },
                          subcategories: {
                            type: 'array',
                            items: { type: 'object' },
                          },
                        },
                      },
                    },
                  },
                },
                hierarchy_statistics: {
                  type: 'object',
                  properties: {
                    total_subcategories: { type: 'number', example: 50 },
                    hierarchy_depth: { type: 'number', example: 3 },
                  },
                },
              },
            },
            metadata: {
              type: 'object',
              properties: {
                language: { type: 'string', example: 'en' },
                retrieved_at: { type: 'string', example: '2026-02-24T12:00:00.000Z' },
                api_version: { type: 'string', example: '2.0.0' },
                hierarchical_fetch: { type: 'boolean', example: true },
                includes_all_subcategories: { type: 'boolean', example: true },
                includes_all_professions: { type: 'boolean', example: true },
              },
            },
          },
        },
      }),
      ApiErrorResponses(400, 401, 404, 500),
    ),
};
