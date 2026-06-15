import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('review')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  @Post()
  @UseInterceptors(FilesInterceptor('reviewImages', 3))
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req
  ) {
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => this.cloudinaryService.uploadFile(file, 'reviews'));
      imageUrls = await Promise.all(uploadPromises);
    }
    return this.reviewService.create({
      ...createReviewDto,
      reviewImages: imageUrls,
    }, req.user.id);
  }

  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(+id);
  }

  @Public()
  @Get('product/:id')
  findByProductId(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.reviewService.findByProductId(id, req.user?.id);
  }

  @Roles('staff')
  @Patch('hidden/:id')
  updateReviewHidden(@Param('id', ParseIntPipe) id: number, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.updateReviewHidden(id, updateReviewDto.isHidden);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(+id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(+id);
  }
}
