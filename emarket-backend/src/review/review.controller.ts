import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Request, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
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
  findByProductId(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('rating') rating?: string,
    @Request() req?: any
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 10;
    const r = rating && rating !== 'all' ? parseInt(rating, 10) : undefined;
    return this.reviewService.findByProductId(id, p, l, req?.user?.id, r);
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

  @Roles('seller')
  @Get('seller/reviews')
  async findSellerReviews(@Request() req) {
    return this.reviewService.findSellerReviews(req.user.id);
  }

  @Roles('seller')
  @Patch('seller/reply/:id')
  async replyToReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() replyReviewDto: ReplyReviewDto,
    @Request() req
  ) {
    return this.reviewService.replyToReview(id, req.user.id, replyReviewDto.sellerReply);
  }
}
