import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateWithdrawalDto, ResolveWithdrawalDto } from './dto/withdrawal.dto';
import { WithdrawalStatus } from 'src/generated/prisma/enums';


@Controller('withdrawal')
export class WithdrawalController {
    constructor(private readonly withdrawalService: WithdrawalService) { }

    @Get('balance')
    @Roles('seller')
    getBalance(@Request() req) {
        return this.withdrawalService.getBalance(req.user.id);
    }

    @Get('my-requests')
    @Roles('seller')
    getMyRequests(@Request() req) {
        return this.withdrawalService.getMyRequests(req.user.id);
    }

    @Post('request')
    @Roles('seller')
    createRequest(@Request() req, @Body() dto: CreateWithdrawalDto) {
        return this.withdrawalService.createRequest(req.user.id, dto);
    }

    @Get('admin/list')
    @Roles('admin')
    findAll(@Query('status') status?: WithdrawalStatus) {
        return this.withdrawalService.findAll(status);
    }

    @Patch('admin/:id/resolve')
    @Roles('admin')
    resolve(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ResolveWithdrawalDto,
    ) {
        return this.withdrawalService.resolve(id, dto);
    }
}