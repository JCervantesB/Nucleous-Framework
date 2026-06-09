import { Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { auth } from './better-auth.config.js';

@Controller('auth')
export class AuthController {
  @Post('+all')
  async handleAuth(@Req() req: Request) {
    return auth.handler(req as any);
  }
}
