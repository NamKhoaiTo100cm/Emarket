import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateConfigDto } from './dto/update-config.dto';

@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly configService: SystemConfigService) {}

  @Get()
  @Roles('admin')
  getAll() {
    return this.configService.getAll();
  }

  @Patch(':key')
  @Roles('admin')
  update(@Param('key') key: string, @Body() dto: UpdateConfigDto) {
    return this.configService.set(key, dto.value);
  }
}
