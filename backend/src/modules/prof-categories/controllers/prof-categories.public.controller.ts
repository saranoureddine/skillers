import {
  Body,
  Controller,
  Post,
  Req,
  Headers,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfCategoriesPublicService } from '../services/prof-categories.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfCategoriesPublicControllerDocs } from '../docs/prof-categories.swagger';
import {
  GetCategoriesDto,
  GetCategoryDto,
  ToggleTopSubcategoryDto,
  GetTopSubcategoriesDto,
  UploadCategoryImageDto,
  GetHierarchicalCategoriesDto,
} from '../dto';

/**
 * Public ProfCategories Controller — handles all profession categories endpoints matching Yii API
 * All routes prefixed with /public/prof-categories
 */
@Controller('public/prof-categories')
@ProfCategoriesPublicControllerDocs.controller()
export class ProfCategoriesPublicController {
  constructor(
    private readonly profCategoriesPublicService: ProfCategoriesPublicService,
  ) {}

  /**
   * Helper method to extract and validate token
   */
  private async validateToken(req: Request): Promise<string> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.profCategoriesPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user.id;
  }

  @Post('get-categories')
  @Public() // Temporarily public - will validate token manually
  @ProfCategoriesPublicControllerDocs.getCategories()
  async getCategories(
    @Req() req: Request,
    @Body() dto: GetCategoriesDto,
    @Headers('Language') languageCode?: string,
  ) {
    await this.validateToken(req); // Validate token even for GET
    return this.profCategoriesPublicService.getCategories(
      dto,
      languageCode || 'en',
    );
  }

  @Post('get-category')
  @Public() // Temporarily public - will validate token manually
  @ProfCategoriesPublicControllerDocs.getCategory()
  async getCategory(
    @Req() req: Request,
    @Body() dto: GetCategoryDto,
    @Headers('Language') languageCode?: string,
  ) {
    await this.validateToken(req); // Validate token even for GET
    return this.profCategoriesPublicService.getCategory(dto, languageCode || 'en');
  }

  @Post('toggle-top-subcategory')
  @Public() // Temporarily public - will validate token manually
  @ProfCategoriesPublicControllerDocs.toggleTopSubcategory()
  async toggleTopSubcategory(
    @Req() req: Request,
    @Body() dto: ToggleTopSubcategoryDto,
  ) {
    await this.validateToken(req);
    return this.profCategoriesPublicService.toggleTopSubcategory(dto);
  }

  @Post('get-top-subcategories')
  @Public() // Temporarily public - will validate token manually
  @ProfCategoriesPublicControllerDocs.getTopSubcategories()
  async getTopSubcategories(
    @Req() req: Request,
    @Body() dto: GetTopSubcategoriesDto,
    @Headers('Language') languageCode?: string,
  ) {
    await this.validateToken(req);
    return this.profCategoriesPublicService.getTopSubcategories(
      dto,
      languageCode || 'en',
    );
  }

  @Post('upload-category-image')
  @Public() // Temporarily public - will validate token manually
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  @ProfCategoriesPublicControllerDocs.uploadCategoryImage()
  async uploadCategoryImage(
    @Req() req: Request,
    @Body() dto: UploadCategoryImageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    await this.validateToken(req);
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }
    return this.profCategoriesPublicService.uploadCategoryImage(dto, file);
  }

  @Post('get-hierarchical-categories')
  @Public() // Temporarily public - will validate token manually
  @ProfCategoriesPublicControllerDocs.getHierarchicalCategories()
  async getHierarchicalCategories(
    @Req() req: Request,
    @Body() dto: GetHierarchicalCategoriesDto,
    @Headers('Language') languageCode?: string,
  ) {
    await this.validateToken(req);
    return this.profCategoriesPublicService.getHierarchicalCategories(
      dto,
      languageCode || 'en',
    );
  }
}
