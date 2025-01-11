import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ConfigModule } from '@nestjs/config';

@Module({
	providers: [NotificationsService],
	exports: [NotificationsService],
	imports: [ConfigModule.forRoot()]
})
export class NotificationsModule { }
