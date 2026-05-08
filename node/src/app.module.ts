import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './items/item.entity';
import { User } from './auth/user.entity';
import { Scan } from './scans/scan.entity';
import { ItemsModule } from './items/items.module';
import { AuthModule } from './auth/auth.module';
import { FirebaseModule } from './firebase/firebase.module';
import { UsersModule } from './users/users.module';
import { ScansModule } from './scans/scans.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
        process.env.DATABASE_URL ??
        'postgresql://postgres:voleak@localhost:5432/crud_api',
      entities: [Item, User, Scan],
      synchronize: true,
      logging: ['query', 'error'],
    }),
    FirebaseModule,
    ItemsModule,
    AuthModule,
    UsersModule,
    ScansModule,
  ],
})
export class AppModule {}
