import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';

export type UserView = {
  id: number;
  phone: string;
  role: string | null;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async listAll(): Promise<UserView[]> {
    const rows = await this.users.find({ order: { id: 'ASC' } });
    return rows.map((u) => ({
      id: u.id,
      phone: u.phone,
      role: u.role ?? null,
    }));
  }

  async setRole(
    id: number,
    role: 'ADMIN' | 'EMPLOYEE' | null,
  ): Promise<UserView> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User not found with id: ${id}`);
    user.role = role;
    const saved = await this.users.save(user);
    return { id: saved.id, phone: saved.phone, role: saved.role ?? null };
  }
}
