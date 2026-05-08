import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemDto } from './dto/item.dto';

@Controller('api/items')
export class ItemsController {
  constructor(private readonly service: ItemsService) {}

  @Get()
  getAll(): Promise<ItemDto[]> {
    return this.service.getAll();
  }

  @Get('health')
  health(): { status: string; message: string } {
    return { status: 'UP', message: 'CRUD API is running' };
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<ItemDto> {
    return this.service.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: ItemDto): Promise<ItemDto> {
    return this.service.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ItemDto,
  ): Promise<ItemDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.service.delete(id);
    return { message: 'Item deleted successfully' };
  }
}
