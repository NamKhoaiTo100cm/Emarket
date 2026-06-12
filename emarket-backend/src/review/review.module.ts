import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [ReviewController],
  imports: [CloudinaryModule],
  providers: [ReviewService],
})
export class ReviewModule { }
