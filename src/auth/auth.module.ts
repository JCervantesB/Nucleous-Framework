import { Module } from '@nestjs/common';
import { AuthModule as NestAuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './better-auth.config.js';
import { AuthController } from './interfaces/http/auth.controller.js';

@Module({
  imports: [NestAuthModule.forRoot({ auth, disableControllers: true })],
  controllers: [AuthController],
})
export class AuthModule {}