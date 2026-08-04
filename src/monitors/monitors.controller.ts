import {
  Controller,
  Body,
  Get,
  Post,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateMonitorDto } from './create-monitor.dto';
import { Monitor } from './entities/monitor.entity';
import { MonitorsService } from './monitors.service';
import { UpdateMonitorDto } from './update-monitor.dto';

@Controller('api/monitors')
export class MonitorsController {
  constructor(private readonly monitorsService: MonitorsService) {}

  @Get()
  findAll(): Promise<Monitor[]> {
    return this.monitorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Monitor> {
    return this.monitorsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMonitorDto): Promise<Monitor> {
    return this.monitorsService.create(dto);
  }

  @Post('check-all')
  async checkAll() {
    await this.monitorsService.checkAll();

    return {
      message: 'Tous les services ont été vérifiés',
    };
  }

  @Post(':id/check')
  check(@Param('id', ParseIntPipe) id: number) {
    return this.monitorsService.check(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMonitorDto,
  ): Promise<Monitor> {
    return this.monitorsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.monitorsService.remove(id);
  }
}
