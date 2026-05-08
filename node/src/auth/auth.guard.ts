import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

export interface AuthedRequest {
  user?: User;
  headers: Record<string, string | string[] | undefined>;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers['authorization'];
    const raw = Array.isArray(header) ? header[0] : header;
    if (!raw || !raw.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = raw.slice('Bearer '.length).trim();
    const phone = decodePhone(token);
    if (!phone) throw new UnauthorizedException('Malformed token');

    const user = await this.users.findOne({ where: { phone } });
    if (!user) throw new UnauthorizedException('Unknown user');

    req.user = user;
    return true;
  }
}

function decodePhone(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [phone] = decoded.split(':');
    return phone || null;
  } catch {
    return null;
  }
}
