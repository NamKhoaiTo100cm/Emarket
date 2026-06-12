import { Controller, Post, UseGuards, Body, Get, Param, Patch, Delete, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AddressService } from './address.service';
import { CreateUserAddressDto } from './dto/create-address.dto';
import { UpdateUserAddressDto } from './dto/update-address.dto';


@Controller('addresses')
export class AddressController {
    constructor(private readonly addressService: AddressService) { }

    @Post()
    create(@Req() req, @Body() createAddressDto: CreateUserAddressDto) {
        return this.addressService.create(req.user.id, createAddressDto);
    }

    @Get()
    findAll(@Req() req) {
        return this.addressService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Req() req, @Param('id') id: string) {
        return this.addressService.findOne(req.user.id, +id);
    }

    @Patch(':id')
    update(@Req() req, @Param('id') id: string, @Body() updateAddressDto: UpdateUserAddressDto) {
        return this.addressService.update(req.user.id, +id, updateAddressDto);
    }

    @Delete(':id')
    remove(@Req() req, @Param('id') id: string) {
        return this.addressService.remove(req.user.id, +id);
    }

    @Patch(':id/set-default')
    setDefault(@Req() req, @Param('id') id: string) {
        return this.addressService.setDefault(req.user.id, +id);
    }
}
