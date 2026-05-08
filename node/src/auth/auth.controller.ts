import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import type * as admin from 'firebase-admin';
import { User } from './user.entity';
import { VerifyOtpRequest } from './dto/verify-otp-request.dto';
import { VerifyOtpResponse } from './dto/verify-otp-response.dto';
import { AuthGuard, AuthedRequest } from './auth.guard';
import { FIREBASE_AUTH, FirebaseAuthService } from '../firebase/firebase.module';

@Controller('api/auth')
export class AuthController {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @Inject(FIREBASE_AUTH)
    private readonly firebaseAuth: FirebaseAuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() body: VerifyOtpRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VerifyOtpResponse> {
    if (!this.firebaseAuth) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
      return new VerifyOtpResponse(
        null as unknown as string,
        null,
        null,
        'Firebase not configured (set FIREBASE_CREDENTIALS_PATH)',
      );
    }

    let decoded: admin.auth.DecodedIdToken;
    try {
      decoded = await this.firebaseAuth.verifyIdToken(body.idToken);
    } catch {
      res.status(HttpStatus.UNAUTHORIZED);
      return new VerifyOtpResponse(
        null as unknown as string,
        null,
        null,
        'Invalid or expired Firebase token',
      );
    }

    const phone = decoded.phone_number;
    if (!phone) {
      res.status(HttpStatus.UNAUTHORIZED);
      return new VerifyOtpResponse(
        null as unknown as string,
        null,
        null,
        'Token has no phone_number',
      );
    }

    const adminPhone = (
      this.config.get<string>('BOOTSTRAP_ADMIN_PHONE', '') ?? ''
    ).trim();

    let user = await this.users.findOne({ where: { phone } });
    if (!user) {
      user = this.users.create({ phone, role: null });
    }
    if (adminPhone && phone === adminPhone) {
      user.role = 'ADMIN';
    }
    await this.users.save(user);

    const token = Buffer.from(`${user.phone}:${randomUUID()}`).toString('base64');

    return new VerifyOtpResponse(
      user.phone,
      user.role ?? null,
      token,
      'Login successful',
    );
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: AuthedRequest) {
    const u = req.user!;
    return { id: u.id, phone: u.phone, role: u.role ?? null };
  }
}
