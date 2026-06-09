import { Module } from '@nestjs/common';
import { BusinessController } from './infrastructure/http/business.controller.js';
import { ContactController } from './infrastructure/http/contact.controller.js';
import { ActivityController } from './infrastructure/http/activity.controller.js';
import { RecordEventController } from './infrastructure/http/record-event.controller.js';
import { ConfigController } from './infrastructure/http/config.controller.js';
import { CurrentBusinessService } from './application/current-business.service.js';
import { DrizzleBusinessRepository } from './infrastructure/persistence/drizzle-business.repository.js';
import { DrizzleContactRepository } from './infrastructure/persistence/drizzle-contact.repository.js';
import { DrizzleActivityRepository } from './infrastructure/persistence/drizzle-activity.repository.js';
import { DrizzleRecordEventRepository } from './infrastructure/persistence/drizzle-record-event.repository.js';
import { DrizzleConfigParameterRepository } from './infrastructure/persistence/drizzle-config-parameter.repository.js';
import { CreateBusinessUseCase } from './domain/use-cases/create-business.use-case.js';
import { GetBusinessUseCase } from './domain/use-cases/get-business.use-case.js';
import { CreateContactUseCase } from './domain/contacts/use-cases/create-contact.use-case.js';
import { ListContactsUseCase } from './domain/contacts/use-cases/list-contacts.use-case.js';
import { CreateActivityUseCase } from './domain/activity/use-cases/create-activity.use-case.js';
import { CompleteActivityUseCase } from './domain/activity/use-cases/complete-activity.use-case.js';
import { ListActivitiesForRecordUseCase } from './domain/activity/use-cases/list-activities-for-record.use-case.js';
import { ListActivitiesForUserUseCase } from './domain/activity/use-cases/list-activities-for-user.use-case.js';
import { AddRecordEventUseCase } from './domain/record-event/use-cases/add-record-event.use-case.js';
import { ListRecordEventsUseCase } from './domain/record-event/use-cases/list-record-events.use-case.js';
import { GetConfigParameterUseCase } from './domain/config-parameter/use-cases/get-config-parameter.use-case.js';
import { SetConfigParameterUseCase } from './domain/config-parameter/use-cases/set-config-parameter.use-case.js';
import { ListConfigParametersUseCase } from './domain/config-parameter/use-cases/list-config-parameters.use-case.js';
import { BUSINESS_REPOSITORY } from './domain/repositories/business.repository.js';
import { CONTACT_REPOSITORY } from './domain/contacts/contact.repository.js';
import { ACTIVITY_REPOSITORY } from './domain/activity/activity.repository.js';
import { RECORD_EVENT_REPOSITORY } from './domain/record-event/record-event.repository.js';
import { CONFIG_PARAMETER_REPOSITORY } from './domain/config-parameter/config-parameter.repository.js';

@Module({
  controllers: [
    BusinessController,
    ContactController,
    ActivityController,
    RecordEventController,
    ConfigController,
  ],
  providers: [
    CurrentBusinessService,
    {
      provide: BUSINESS_REPOSITORY,
      useClass: DrizzleBusinessRepository,
    },
    {
      provide: CONTACT_REPOSITORY,
      useClass: DrizzleContactRepository,
    },
    {
      provide: ACTIVITY_REPOSITORY,
      useClass: DrizzleActivityRepository,
    },
    {
      provide: RECORD_EVENT_REPOSITORY,
      useClass: DrizzleRecordEventRepository,
    },
    {
      provide: CONFIG_PARAMETER_REPOSITORY,
      useClass: DrizzleConfigParameterRepository,
    },
    CreateBusinessUseCase,
    GetBusinessUseCase,
    CreateContactUseCase,
    ListContactsUseCase,
    CreateActivityUseCase,
    CompleteActivityUseCase,
    ListActivitiesForRecordUseCase,
    ListActivitiesForUserUseCase,
    AddRecordEventUseCase,
    ListRecordEventsUseCase,
    GetConfigParameterUseCase,
    SetConfigParameterUseCase,
    ListConfigParametersUseCase,
  ],
  exports: [CurrentBusinessService],
})
export class CoreModule {}
