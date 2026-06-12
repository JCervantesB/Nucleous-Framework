import { Controller, Post, Get, Body, Res, Req, HttpStatus, HttpCode } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Session, AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { LoginDto, RegisterDto, RefreshTokenDto, AuthResponseDto, UserResponseDto, SessionResponseDto } from './dto/auth.dtos.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Post('login')
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Iniciar sesión con email y contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Sesión iniciada exitosamente',
    type: () => AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return { message: 'Use better-auth client SDK' };
  }

  @Post('register')
  @AllowAnonymous()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ description: 'Registrar un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: () => AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o email ya registrado' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    return { message: 'Use better-auth client SDK' };
  }

  @Post('refresh')
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Refrescar token de acceso' })
  @ApiResponse({
    status: 200,
    description: 'Token refrescado exitosamente',
    type: () => AuthResponseDto,
  })
  async refresh(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    return { message: 'Use better-auth client SDK' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('better-auth.session_token');
    return { success: true, message: 'Sesión cerrada exitosamente' };
  }

  @Get('session')
  @ApiOperation({ description: 'Obtener sesión actual' })
  @ApiResponse({
    status: 200,
    description: 'Sesión obtenida exitosamente',
    type: () => SessionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getSession(@Session() session: any) {
    if (!session) {
      return null;
    }

    return {
      sessionId: session.session?.id,
      expiresAt: new Date(session.session?.expiresAt ?? Date.now()),
      userId: session.user?.id,
      user: {
        id: session.user?.id,
        name: session.user?.name,
        email: session.user?.email,
        role: session.user?.role,
        createdAt: new Date(session.user?.createdAt ?? Date.now()),
      },
    };
  }
}