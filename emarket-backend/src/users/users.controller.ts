import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe, ParseEnumPipe, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../common/decorators/public.decorator';
import { UserStatus } from '../generated/prisma/enums';
import { Roles } from '../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Public()
  @Post() // ❌ không có guard => public
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('staff')
  @Roles('admin')
  createStaff(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createStaff(createUserDto);
  }

  @Get()
  @Roles('staff', 'admin')
  findAll(@Query('role') role?: string[]) {
    const roles = role ? (Array.isArray(role) ? role : [role]) : [];
    return this.usersService.findAll(roles);
  }

  @Get('/profile')
  findProfile(@Req() req) {
    const userId = req.user.id;
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @UseInterceptors(FileInterceptor('avatar'))
  updateProfile(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.id;
    const { role, status, ...allowedDto } = updateUserDto;
    return this.usersService.updateProfile(userId, allowedDto, file);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.usersService.findOne(+id);
  }

  @Roles('staff', 'admin')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: UserStatus) {
    return this.usersService.updateStatus(+id, status);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }


  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}