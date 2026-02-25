import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: process.env.DB_TYPE || 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME || 'moustafa',
  password: process.env.DB_PASSWORD || 'StrongPassword123!',
  database: process.env.DB_DATABASE || 'moustafa_skillers',
  charset: process.env.DB_CHARSET || 'utf8mb4',
  synchronize: false, // Disabled - we're using existing database schema
  logging: process.env.NODE_ENV === 'development',
}));
