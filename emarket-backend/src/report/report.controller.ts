import { Controller, Get, Post, Body, Query, Request, ParseIntPipe } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto, ResolveReportDto } from './dto/report.dto';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('report')
export class ReportController {
    constructor(private readonly reportService: ReportService) {}

    @Post()
    create(@Request() req, @Body() dto: CreateReportDto) {
        return this.reportService.createReport(req.user.id, dto.type, dto.targetId, dto.reason);
    }

    @Get('stats')
    @Roles('staff', 'admin')
    getStats() {
        return this.reportService.getReportStats();
    }

    @Get('details')
    @Roles('staff', 'admin')
    getDetails(
        @Query('type') type: string,
        @Query('targetId', ParseIntPipe) targetId: number,
    ) {
        return this.reportService.getReportDetails(type, targetId);
    }

    @Post('resolve')
    @Roles('staff', 'admin')
    resolve(@Request() req, @Body() dto: ResolveReportDto) {
        return this.reportService.resolveReport(dto.type, dto.targetId, dto.action, req.user.id);
    }

    @Get('history')
    @Roles('staff', 'admin')
    getHistory() {
        return this.reportService.getReportHistory();
    }
}
