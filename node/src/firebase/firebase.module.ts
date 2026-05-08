import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';

export const FIREBASE_AUTH = 'FIREBASE_AUTH';

export type FirebaseAuthService = admin.auth.Auth | null;

@Global()
@Module({
  providers: [
    {
      provide: FIREBASE_AUTH,
      inject: [ConfigService],
      useFactory: (config: ConfigService): FirebaseAuthService => {
        const logger = new Logger('FirebaseAdmin');
        const credPath = (
          config.get<string>('FIREBASE_CREDENTIALS_PATH', '') ?? ''
        ).trim();

        if (!credPath) {
          logger.warn(
            'FIREBASE_CREDENTIALS_PATH not set - /api/auth/verify-otp will return 503 until configured.',
          );
          return null;
        }

        if (!admin.apps.length) {
          const serviceAccount = JSON.parse(readFileSync(credPath, 'utf8'));
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          logger.log(`Firebase Admin initialized from ${credPath}`);
        }
        return admin.auth();
      },
    },
  ],
  exports: [FIREBASE_AUTH],
})
export class FirebaseModule {}
