import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ScansService } from './scans.service';
import { CreateScanDto } from './dto/create-scan.dto';
import { AuthGuard, AuthedRequest } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/scans')
@UseGuards(AuthGuard, RolesGuard)
@Roles('EMPLOYEE', 'ADMIN')
export class ScansController {
  constructor(private readonly scans: ScansService) {}

  @Post()
  async create(@Body() dto: CreateScanDto, @Req() req: AuthedRequest) {
    const scan = await this.scans.record(req.user!.id, dto.type);
    return scan;
  }

  @Get('me')
  async mine(@Req() req: AuthedRequest) {
    return this.scans.listForUser(req.user!.id);
  }
}
