import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scan, ScanType } from './scan.entity';

@Injectable()
export class ScansService {
  constructor(
    @InjectRepository(Scan)
    private readonly repo: Repository<Scan>,
  ) {}

  async record(userId: number, type: ScanType): Promise<Scan> {
    const scan = this.repo.create({ userId, type });
    return this.repo.save(scan);
  }

  async listForUser(userId: number, limit = 50): Promise<Scan[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
