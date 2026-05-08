import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { ItemDto } from './dto/item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly repo: Repository<Item>,
  ) {}

  async getAll(): Promise<ItemDto[]> {
    const items = await this.repo.find();
    return items.map((i) => this.toDto(i));
  }

  async getById(id: number): Promise<ItemDto> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item not found with id: ${id}`);
    }
    return this.toDto(item);
  }

  async create(dto: ItemDto): Promise<ItemDto> {
    const entity = this.repo.create({
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price ?? null,
    });
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async update(id: number, dto: ItemDto): Promise<ItemDto> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item not found with id: ${id}`);
    }
    if (dto.name !== undefined && dto.name !== null) item.name = dto.name;
    if (dto.description !== undefined) item.description = dto.description;
    if (dto.price !== undefined) item.price = dto.price;
    const saved = await this.repo.save(item);
    return this.toDto(saved);
  }

  async delete(id: number): Promise<void> {
    const exists = await this.repo.exist({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Item not found with id: ${id}`);
    }
    await this.repo.delete(id);
  }

  private toDto(item: Item): ItemDto {
    return {
      id: item.id,
      name: item.name,
      description: item.description ?? null,
      price: item.price ?? null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
