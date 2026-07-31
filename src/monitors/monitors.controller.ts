import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

@Controller('api/monitors')
export class MonitorsController {
  @Get()
  findAll(): string {
    return 'tout';
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): string {
    return `juste l'id: ${id}`;
  }

  @Post()
  insertOne(): string {
    return 'insert un truc';
  }

  @Patch(':id')
  updateOne(@Param('id', ParseIntPipe) id: number): string {
    return `update l'id ${id}`;
  }

  @Delete(':id')
  deleteOne(@Param('id', ParseIntPipe) id: number): string {
    return `supprime l'id ${id}`;
  }
}
