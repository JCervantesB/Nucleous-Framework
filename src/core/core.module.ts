import { Module } from '@nestjs/common';
import { BusinessController } from './infrastructure/http/business.controller.js';
import { ContactController } from './infrastructure/http/contact.controller.js';
import { ActivityController } from './infrastructure/http/activity.controller.js';
import { RecordEventController } from './infrastructure/http/record-event.controller.js';
import { ConfigController } from './infrastructure/http/config.controller.js';
import { CurrentBusinessService } from './application/current-business.service.js';

@Module({
  controllers: [
    BusinessController,
    ContactController,
    ActivityController,
    RecordEventController,
    ConfigController,
  ],
  providers: [CurrentBusinessService],
  exports: [CurrentBusinessService],
})
export class CoreModule {}
