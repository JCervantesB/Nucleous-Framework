import { Global, Module } from '@nestjs/common';
import { db } from '../../../db/client.js';

@Global()
@Module({
  providers: [
    {
      provide: 'DB',
      useValue: db,
    },
  ],
  exports: ['DB'],
})
export class DatabaseModule {}
