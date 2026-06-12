import { Controller, UseGuards, Request, Post, Body, Get, Param, Put, Delete, UseInterceptors, UploadedFile, UploadedFiles, ParseIntPipe, ParseEnumPipe, Query } from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Public } from '../common/decorators/public.decorator';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from '../common/decorators/roles.decorator';
import { ShopStatus, VerificationStatus } from '../generated/prisma/enums';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';

@Controller('shop')
export class ShopController {
    constructor(private readonly shopService: ShopService) { }

    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'avatarImage', maxCount: 1 },
        { name: 'bannerImage', maxCount: 1 },
    ]))
    async create(
        @Request() req,
        @Body() dto: CreateShopDto,
        @UploadedFiles() files: { avatarImage?: Express.Multer.File[], bannerImage?: Express.Multer.File[] }
    ) {
        const shop = await this.shopService.create(req.user.id, dto, files);
        return { message: 'Tạo cửa hàng thành công', data: shop }
    }

    @Get()
    @Roles('admin', 'staff')
    async findAll() {
        return await this.shopService.findAll();
    }

    @Get('verifications')
    @Roles('admin', 'staff')
    async getVerifications(@Query('status') status?: VerificationStatus) {
        return await this.shopService.getVerifications(status);
    }

    @Get('admin/statistics')
    @Roles('admin')
    async getAdminStatistics(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return await this.shopService.getAdminStatistics(startDate, endDate);
    }

    @Get('my-verification')
    async getMyVerification(@Request() req) {
        const shop = await this.shopService.findOneByUserId(req.user.id);
        return await this.shopService.getMyVerification(shop.id);
    }

    @Get(':id')
    @Public()
    async findOne(@Param('id') id: string) {
        return await this.shopService.findOne(+id);
    }

    @Get('my-shop/statistics')
    async getShopStatistics(
        @Request() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const shop = await this.shopService.findOneByUserId(req.user.id);
        return await this.shopService.getStatistics(shop.id, startDate, endDate);
    }

    @Get('my-shop/:id')
    async findOneByUserId(@Param('id', ParseIntPipe) id: number) {
        return await this.shopService.findOneByUserId(id);
    }

    @Put('update-status/:id')
    async updateShopStatus(@Param('id', ParseIntPipe) id: number, @Body() body: { status: ShopStatus }) {
        return await this.shopService.updateShopStatus(id, body.status);
    }

    @Post('verification')
    @UseInterceptors(FilesInterceptor('documents', 10))
    async submitVerification(
        @Request() req,
        @Body() dto: SubmitVerificationDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        const shop = await this.shopService.findOneByUserId(req.user.id);
        return await this.shopService.submitVerification(shop.id, dto, files ?? []);
    }

    @Put('verification/:id/review')
    @Roles('admin', 'staff')
    async reviewVerification(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
        @Body() dto: ReviewVerificationDto,
    ) {
        return await this.shopService.reviewVerification(id, req.user.id, dto);
    }

    @Put('profile')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'avatarImage', maxCount: 1 },
        { name: 'bannerImage', maxCount: 1 },
    ]))
    async updateProfile(
        @Request() req,
        @Body() dto: UpdateShopDto,
        @UploadedFiles() files?: { avatarImage?: Express.Multer.File[], bannerImage?: Express.Multer.File[] }
    ) {
        const shop = await this.shopService.updateProfile(req.user.id, dto, files);
        return { message: 'Cập nhật cửa hàng thành công', data: shop }
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateShopDto) {
        return await this.shopService.update(+id, dto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.shopService.remove(+id);
    }
}
