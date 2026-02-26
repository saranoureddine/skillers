import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingPackageEntity } from './entities/booking-package.entity';
import { BookingPackagesPublicService } from './services/booking-packages.public.service';
import { BookingPackagesPublicController } from './controllers/booking-packages.public.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BookingPackageEntity])],
  controllers: [BookingPackagesPublicController],
  providers: [BookingPackagesPublicService],
  exports: [BookingPackagesPublicService],
})
export class BookingPackagesModule {}
