import { Module } from '@nestjs/common';
import { OrganizationController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfigFromEnv, Organization, OrganizationUser } from '@common';
import { AuthLibService } from '@app/auth-lib';

@Module({
  imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      TypeOrmModule.forRoot(getDatabaseConfigFromEnv(process.env)),
      TypeOrmModule.forFeature([Organization, OrganizationUser]),
    ],
  controllers: [OrganizationController],
  providers: [OrganizationsService, AuthLibService],
})
export class OrganizationsModule {}
