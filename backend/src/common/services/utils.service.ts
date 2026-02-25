import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { AgAttachmentEntity } from '../../modules/attachments/entities/ag-attachment.entity';
// TODO: Import these entities when they are created
// import { AgLabelsEntity } from '../../modules/shared/entities/ag-labels.entity';
// import { AgLanguagesEntity } from '../../modules/shared/entities/ag-languages.entity';
// import { AgTranslationEntity } from '../../modules/shared/entities/ag-translation.entity';
// import { ActionLogsEntity } from '../../modules/shared/entities/action-logs.entity';
// import { RolesAccessEntity } from '../../modules/shared/entities/roles-access.entity';
// import { RoleActionsEntity } from '../../modules/shared/entities/role-actions.entity';

/**
 * Utils Service
 * 
 * Provides utility functions for token generation, file operations, email sending,
 * translations, logging, and other common operations.
 * 
 * Converted from Yii Utils class
 */
@Injectable()
export class UtilsService {
  private readonly logger = new Logger(UtilsService.name);
  private readonly basePath: string;
  private readonly uploadsPath: string;
  private readonly tempPath: string;
  private readonly companyName: string;

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(AgAttachmentEntity)
    private readonly attachmentsRepository: Repository<AgAttachmentEntity>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.basePath = this.configService.get<string>('app.basePath') || process.cwd();
    this.uploadsPath = path.join(this.basePath, 'web', 'uploads');
    this.tempPath = path.join(this.uploadsPath, 'temp');
    this.companyName = this.configService.get<string>('app.companyName') || 'skillers';
  }

  /**
   * Generate a unique token (224 characters)
   * Matches Yii Utils::generateToken()
   */
  async generateToken(): Promise<string> {
    let token: string;
    let exists = true;

    do {
      // Generate a crypto-secure 224 characters long
      const randomBytes = crypto.randomBytes(112);
      const randomString = randomBytes.toString('hex');

      // Append the current timestamp to the random string
      const uniqueString = randomString + Date.now().toString();

      // Generate a unique token by hashing the unique string
      token = crypto.createHash('sha512').update(uniqueString).digest('hex');

      // Check if token already exists in database
      const existingUser = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.mobile_token = :token OR user.token = :token', { token })
        .getOne();

      exists = !!existingUser;
    } while (exists);

    return token;
  }

  /**
   * Generate a 4-digit OTP code
   * Matches Yii Utils::generateOtp()
   */
  generateOtp(): string {
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }

  /**
   * Find translated string by label key and language
   * Matches Yii Utils::findString()
   * 
   * TODO: Implement when AgLabels, AgLanguages, AgTranslation entities are created
   */
  async findString(
    labelKey: string,
    languageCode: string = 'en',
    languageId: number | null = null,
  ): Promise<string> {
    // TODO: Implement translation lookup
    // const label = await this.agLabelsRepository.findOne({ where: { labelKey } });
    // const langCond = languageId ? { id: languageId } : { shortcut: languageCode };
    // const language = await this.agLanguagesRepository.findOne({ where: langCond });
    // 
    // if (label && language) {
    //   const trans = await this.agTranslationRepository.findOne({
    //     where: { languageId: language.id, labelId: label.id },
    //   });
    //   if (trans && trans.translation) {
    //     return trans.translation;
    //   }
    //   
    //   if (languageCode !== 'en') {
    //     const trans = await this.agTranslationRepository.findOne({
    //       where: { languageId: 1, labelId: label.id },
    //     });
    //     if (trans) {
    //       return trans.translation;
    //     }
    //   }
    // }

    // Return label key as fallback
    return labelKey;
  }

  /**
   * Generate a short unique ID (10 characters)
   * Matches Yii Utils::generateShortUniqueId()
   */
  generateShortUniqueId(): string {
    // Use microseconds to increase uniqueness
    const microtime = Date.now() + performance.now();
    
    // Convert the microtime to a base 36 string
    const timestampPart = microtime.toString(36).substring(0, 6);

    // Generate a random base 36 number
    const randomPart = Math.floor(Math.random() * 1679616).toString(36).substring(0, 4); // 1679615 is 36^4 - 1

    // Concatenate the timestamp and random parts
    const uniqueId = timestampPart + randomPart;

    return uniqueId;
  }

  /**
   * Upload a file
   * Matches Yii Utils::uploadFile()
   * 
   * TODO: Implement file upload logic when AgController actions are converted
   */
  async uploadFile(
    table: string,
    type: number,
    file: Express.Multer.File,
    definer: string | null = null,
    id: string | null = null,
  ): Promise<any> {
    // TODO: Implement when AgController::actionDgUpload is converted
    // For now, return a placeholder
    this.logger.warn('uploadFile not yet implemented - requires AgController conversion');
    return { success: false, message: 'File upload not yet implemented' };
  }

  /**
   * Delete a file
   * Matches Yii Utils::deleteFile()
   * 
   * TODO: Implement file deletion logic when AgController actions are converted
   */
  async deleteFile(id: number): Promise<any> {
    // TODO: Implement when AgController::actionDgDeleteAttachment is converted
    // For now, return a placeholder
    this.logger.warn('deleteFile not yet implemented - requires AgController conversion');
    return { success: false, message: 'File deletion not yet implemented' };
  }

  /**
   * Remove temporary file path
   * Matches Yii Utils::removeTempPath()
   */
  async removeTempPath(tableId: string, formDefiner: string): Promise<void> {
    const dirPath = path.join(this.tempPath, tableId, formDefiner);

    if (!fs.existsSync(dirPath)) {
      return;
    }

    try {
      // Ensure the directory exists and is indeed a directory
      if (!fs.statSync(dirPath).isDirectory()) {
        throw new Error(`The specified path is not a directory: ${dirPath}`);
      }

      // Find all files in the directory and its subdirectories
      const files = this.findAllFiles(dirPath);
      for (const file of files) {
        fs.unlinkSync(file); // Delete each file
      }

      // Find all subdirectories
      const directories = this.findAllDirectories(dirPath);

      // Sort directories in descending order to delete the deepest ones first
      directories.sort().reverse();
      for (const directory of directories) {
        fs.rmdirSync(directory); // Remove the directory
      }

      // Finally, remove the top-level directory
      fs.rmdirSync(dirPath);
    } catch (error) {
      this.logger.error(`Error removing temp path: ${error.message}`);
      // Silently fail as per Yii implementation
    }
  }

  /**
   * Find all files recursively
   */
  private findAllFiles(dirPath: string): string[] {
    const files: string[] = [];
    
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        files.push(...this.findAllFiles(itemPath));
      } else {
        files.push(itemPath);
      }
    }
    
    return files;
  }

  /**
   * Find all directories recursively
   */
  private findAllDirectories(dirPath: string): string[] {
    const directories: string[] = [];
    
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        directories.push(itemPath);
        directories.push(...this.findAllDirectories(itemPath));
      }
    }
    
    return directories;
  }

  /**
   * Upload attachments from temp directory
   * Matches Yii Utils::uploadAttachmentFromTemp()
   * 
   * TODO: Implement when AgAttachment entity and related logic are fully converted
   */
  async uploadAttachmentFromTemp(
    model: any,
    primaryKey: string,
    tableId: string,
    formDefiner: string,
  ): Promise<void> {
    const uploadPath = path.join(
      this.uploadsPath,
      tableId,
      model[primaryKey],
      'attaches',
    );

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const tempPath = path.join(this.tempPath, tableId, formDefiner);
    if (!fs.existsSync(tempPath)) {
      return;
    }

    try {
      const kindDirs = fs.readdirSync(tempPath).filter((item) => {
        const itemPath = path.join(tempPath, item);
        return fs.statSync(itemPath).isDirectory();
      });

      for (const kindDir of kindDirs) {
        const type = path.basename(kindDir);
        const kindPath = path.join(tempPath, kindDir);
        const imageFiles = this.findAllFiles(kindPath);

        const onlyOne = type === '1'; // MAIN_IMAGE type
        let count = 0;

        for (const imageFile of imageFiles) {
          if (!onlyOne || count === 0) {
            const pathInfo = path.parse(imageFile);
            const name = pathInfo.name;
            const fileExtension = pathInfo.ext.substring(1); // Remove the dot
            const fileName = `${this.companyName}_${this.formatDate(new Date())}_${Date.now()}.${fileExtension}`;

            const fileSize = fs.statSync(imageFile).size;

            // TODO: Create AgAttachment entity
            // const attachment = this.attachmentsRepository.create({
            //   fileName: name,
            //   rowId: model[primaryKey],
            //   type: parseInt(type),
            //   tableName: tableId,
            //   fileSize: fileSize,
            //   fileExtension: fileExtension,
            //   filePath: '/' + path.relative(
            //     path.join(this.basePath, 'web'),
            //     path.join(uploadPath, fileName),
            //   ).replace(/\\/g, '/'),
            // });

            // if (fs.copyFileSync(imageFile, path.join(uploadPath, fileName)) && await this.attachmentsRepository.save(attachment)) {
            //   if (type === '1') {
            //     model.mainImage = attachment.filePath;
            //   }
            // }
          }

          fs.unlinkSync(imageFile);
          count++;
        }

        fs.rmdirSync(kindPath);
      }

      fs.rmdirSync(tempPath);
    } catch (error) {
      this.logger.error(`Error uploading attachments from temp: ${error.message}`);
      await this.removeTempPath(tableId, formDefiner);
    }
  }

  /**
   * Format date as Ymd_His
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  /**
   * Prepare full-text search query
   * Matches Yii Utils::prepareFullTextSearchQuery()
   */
  prepareFullTextSearchQuery(q: string): string {
    // Define the special operators used in MySQL full-text search in Boolean Mode
    const operators = ['-', '+', '<', '>', '(', ')', '~', '*', '"', "'", 'the', 'THE'];
    const opString = operators.join('');

    // Split the search query into individual words
    const words = q.split(' ');

    // Iterate through each word
    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      const firstChar = word.charAt(0);

      // If the first character is a special operator, handle it accordingly
      if (operators.includes(firstChar)) {
        // If the word has more characters following the operator, treat it as an operator
        if (word.length > 1) {
          const pattern = new RegExp(`([${opString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]\\w+)[^a-zA-Z0-9]*$`);
          const match = word.match(pattern);
          if (match) {
            words[index] = match[1];
          }
        } else {
          // Else, replace the operator with empty string
          words[index] = '';
        }
      } else {
        // Else, replace any special operators found within the word with a placeholder
        words[index] = word.replace(new RegExp(`[${opString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g'), '_HY_');
      }
    }

    // Join the words back into a search query
    return words.join(' ');
  }

  /**
   * Send email
   * Matches Yii Utils::sendEmail()
   * 
   * TODO: Implement email sending using nodemailer or similar
   */
  async sendEmail(email: string, code: string): Promise<boolean> {
    // TODO: Implement email sending
    // This would require:
    // 1. SMTP settings entity/service
    // 2. Email template rendering
    // 3. Nodemailer or similar email library
    this.logger.warn('sendEmail not yet implemented - requires SMTP settings and email template conversion');
    return false;
  }

  /**
   * Round a number to specified precision
   * Matches Yii Utils::roundNum()
   */
  roundNum(num: number | string, precision: number = 2): number {
    return Number(Number(num).toFixed(precision));
  }

  /**
   * Add action log
   * Matches Yii Utils::addActionLog()
   * 
   * TODO: Implement when ActionLogs entity is created
   */
  async addActionLog(
    userId: string,
    actionTitle: string,
    actionType: string,
    request: any = null,
    param: string | null = null,
    details: string | null = null,
    platform: string = 'web',
  ): Promise<void> {
    // TODO: Implement action logging
    // const deviceInfo = request?.headers?.['device-info'] || null;
    // const ipAddress = request?.ip || null;
    // const agent = request?.headers?.['user-agent'] || null;
    // 
    // const log = this.actionLogsRepository.create({
    //   userId: userId,
    //   actionTitle: actionTitle,
    //   actionType: actionType,
    //   param: param,
    //   platform: platform,
    //   actionDetails: details,
    //   deviceInfo: deviceInfo,
    //   ipAddress: ipAddress,
    //   userAgent: agent,
    //   createdAt: new Date(),
    //   createdBy: userId,
    // });
    // 
    // try {
    //   await this.actionLogsRepository.save(log);
    // } catch (error) {
    //   this.logger.error(`Error saving action log: ${error.message}`);
    // }
  }

  /**
   * Check user permission
   * Matches Yii Utils::checkPermission()
   * 
   * TODO: Implement when RolesAccess and RoleActions entities are created
   */
  async checkPermission(user: any, action: string): Promise<any> {
    // TODO: Implement permission checking
    // const permission = await this.dataSource
    //   .createQueryBuilder()
    //   .select('t1.*')
    //   .from('roles_access', 't1')
    //   .innerJoin('role_actions', 't2', 't1.action_id = t2.id AND t2.name = :action', { action })
    //   .where('t1.role = :role', { role: user.role })
    //   .andWhere('t1.have_access = :haveAccess', { haveAccess: true })
    //   .getRawOne();
    // 
    // return permission;
    return null;
  }

  /**
   * Generate GPT response
   * Matches Yii Utils::generateGptResponse()
   * 
   * WARNING: The original code contains an exposed API key. This should be moved to environment variables.
   */
  async generateGptResponse(prompt: string): Promise<any> {
    // WARNING: API key should be in environment variables, not hardcoded
    const apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    if (!apiKey) {
      this.logger.error('OpenAI API key not configured');
      return { succeeded: false, status: 401, response: 'API key not configured' };
    }

    const url = 'https://api.openai.com/v1/chat/completions';

    const data = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'assistant',
          content: prompt,
        },
      ],
      temperature: 0.7,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(data),
      });

      const result: any = {
        succeeded: false,
        status: response.status,
        response: await response.text(),
      };

      if (!response.ok || result.status !== 200) {
        return result;
      }

      try {
        const responseData = await response.json();
        let responseText = responseData.choices[0].message.content;

        // Remove surrounding quotes
        responseText = responseText.replace(/^["']|["']$/g, '');

        result.succeeded = true;
        result.data = responseText;
      } catch (error) {
        this.logger.error(`Error parsing GPT response: ${error.message}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error calling GPT API: ${error.message}`);
      return {
        succeeded: false,
        status: 500,
        response: error.message,
      };
    }
  }
}
