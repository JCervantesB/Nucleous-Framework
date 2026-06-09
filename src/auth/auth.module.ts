import { Module } from '@nestjs/common';
import { AuthModule as NestAuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './better-auth.config.js';
import { AuthController } from './auth.controller.js';

@Module({
  imports: [NestAuthModule.forRoot({ auth })],
  controllers: [AuthController],
})
export class AuthModule {}
