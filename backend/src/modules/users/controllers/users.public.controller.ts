import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UsersPublicService } from '../services/users.public.service';
import { UsersAdminService } from '../services/users.admin.service';
import { UsersService } from '../services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { VerifyResetCodeDto } from '../dto/verify-reset-code.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { SendPhoneVerificationDto, VerifyPhoneCodeDto, RegisterVerifiedDto } from '../dto/phone-verification.dto';
import { SetUserCitiesDto } from '../dto/set-user-cities.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { DeleteUserDto } from '../dto/delete-user.dto';
import { GetAllUsersQueryDto } from '../dto/get-all-users.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { UsersPublicControllerDocs, UsersAdminControllerDocs, UsersControllerDocs } from '../docs/users.swagger';

/**
 * Public Users Controller — handles all public/user-facing endpoints matching Yii API
 * All routes prefixed with /public/users
 */
@Controller('public/users')
@UsersPublicControllerDocs.controller()
export class UsersPublicController {
  constructor(
    private readonly usersPublicService: UsersPublicService,
    private readonly usersService: UsersService,
  ) {}

  @Get('health')
  @Public()
  @UsersPublicControllerDocs.health()
  async health() {
    return this.usersPublicService.health();
  }

  @Post('register')
  @Public()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  @UsersPublicControllerDocs.register()
  async register(
    @Body() dto: RegisterDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const fileMap: any = {};
    if (files) {
      files.forEach((file) => {
        if (file.fieldname === 'cover_image') fileMap.coverImage = file;
        if (file.fieldname === 'cv') fileMap.cv = file;
      });
    }
    return this.usersPublicService.register(dto, fileMap);
  }

  @Post('login')
  @Public()
  @UsersPublicControllerDocs.login()
  async login(@Body() dto: LoginDto) {
    return this.usersPublicService.login(dto);
  }

  @Post('forgot-password')
  @Public()
  @UsersPublicControllerDocs.forgotPassword()
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.usersPublicService.forgotPassword(dto);
  }

  @Post('verify-reset-code')
  @Public()
  @UsersPublicControllerDocs.verifyResetCode()
  async verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    return this.usersPublicService.verifyResetCode(dto);
  }

  @Post('reset-password')
  @Public()
  @UsersPublicControllerDocs.resetPassword()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.usersPublicService.resetPassword(dto);
  }

  @Patch('profile')
  @Public() // Temporarily public - will validate token manually
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  @UsersPublicControllerDocs.updateProfile()
  async updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    // Find user by token
    const user = await this.usersPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const fileMap: any = {};
    if (files) {
      files.forEach((file) => {
        if (file.fieldname === 'cover_image') fileMap.coverImage = file;
        if (file.fieldname === 'cover_video') fileMap.coverVideo = file;
        if (file.fieldname === 'main_image') fileMap.mainImage = file;
        if (file.fieldname === 'image') fileMap.image = file;
      });
    }
    return this.usersPublicService.updateProfile(user.id, dto, fileMap);
  }

  @Post('change-password')
  @Public() // Temporarily public - will validate token manually
  @UsersPublicControllerDocs.changePassword()
  async changePassword(
    @Req() req: Request,
    @Body() dto: ChangePasswordDto,
  ) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    // Find user by token
    const user = await this.usersPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return this.usersPublicService.changePassword(user.id, dto);
  }

  @Post('send-phone-verification')
  @Public()
  @UsersPublicControllerDocs.sendPhoneVerification()
  async sendPhoneVerification(@Body() dto: SendPhoneVerificationDto) {
    return this.usersPublicService.sendPhoneVerification(dto);
  }

  @Post('verify-phone-code')
  @Public()
  @UsersPublicControllerDocs.verifyPhoneCode()
  async verifyPhoneCode(@Body() dto: VerifyPhoneCodeDto) {
    return this.usersPublicService.verifyPhoneCode(dto);
  }

  @Post('register-verified')
  @Public()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  @UsersPublicControllerDocs.registerVerified()
  async registerVerified(
    @Body() dto: RegisterVerifiedDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const fileMap: any = {};
    if (files) {
      files.forEach((file) => {
        if (file.fieldname === 'cover_image') fileMap.coverImage = file;
        if (file.fieldname === 'cv') fileMap.cv = file;
      });
    }
    return this.usersPublicService.registerVerified(dto, fileMap);
  }

  @Post('set-user-cities')
  @Public() // Temporarily public - will validate token manually
  @UsersPublicControllerDocs.setUserCities()
  async setUserCities(
    @Req() req: Request,
    @Body() dto: SetUserCitiesDto,
  ) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    // Find user by token
    const user = await this.usersPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return this.usersPublicService.setUserCities(user.id, dto);
  }

  @Get('get-user-cities')
  @Public() // Temporarily public - will validate token manually
  @UsersPublicControllerDocs.getUserCities()
  async getUserCities(@Req() req: Request) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    // Find user by token
    const user = await this.usersPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return this.usersPublicService.getUserCities(user.id);
  }

  @Post('update-location')
  @Public() // Temporarily public - will validate token manually
  @UsersPublicControllerDocs.updateLocation()
  async updateLocation(
    @Req() req: Request,
    @Body() dto: UpdateLocationDto,
  ) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    // Find user by token
    const user = await this.usersPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return this.usersPublicService.updateLocation(user.id, dto);
  }
}

/**
 * Shared Users Controller — common endpoints accessible by authenticated users.
 * All routes prefixed with /users
 * Moved to this file to consolidate all user endpoints
 */
@Controller('users')
@UsersControllerDocs.controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersPublicService: UsersPublicService,
  ) {}

  @Get()
  @Public() // Temporarily public - will validate token manually if needed
  @UsersControllerDocs.findAll()
  async findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.paginate(query);
  }

  @Get(':id')
  @Public() // Temporarily public - will validate token manually
  @UsersControllerDocs.findOne()
  async findOne(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    // Find user by token to verify authentication
    const authenticatedUser = await this.usersPublicService.findUserByToken(token);
    if (!authenticatedUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Get the requested user
    const user = await this.usersService.findById(id);
    
    // Exclude password from response
    const { password: _, ...userData } = user;
    
    return userData;
  }
}

/**
 * Admin Users Controller — user management endpoints for admin roles.
 * All routes prefixed with /admin/users
 * Moved to this file to consolidate all user endpoints
 */
@Controller('admin/users')
@Public() // Temporarily public for testing - remove when JWT auth is implemented
@UsersAdminControllerDocs.controller()
export class UsersAdminController {
  constructor(
    private readonly usersAdminService: UsersAdminService,
  ) {}

  @Get('get-all-users')
  @UsersAdminControllerDocs.getAllUsers()
  async getAllUsers(
    @Query() query: GetAllUsersQueryDto,
    @CurrentUser('id') adminUserId?: string,
  ) {
    return this.usersAdminService.getAllUsers(query, adminUserId);
  }

  @Post('create-user')
  @UsersAdminControllerDocs.createUser()
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser('id') createdBy?: string,
  ) {
    return this.usersAdminService.createUser(dto, createdBy);
  }

  @Post('update-user')
  @UsersAdminControllerDocs.updateUser()
  async updateUser(@Body() dto: UpdateUserDto) {
    return this.usersAdminService.updateUser(dto);
  }

  @Post('delete-user')
  @UsersAdminControllerDocs.deleteUser()
  async deleteUser(@Body() dto: DeleteUserDto) {
    return this.usersAdminService.deleteUser(dto);
  }
}
