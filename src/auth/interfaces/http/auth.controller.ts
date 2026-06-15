import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Session, AllowAnonymous } from '@thallesp/nestjs-better-auth';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  AuthResponseDto,
  UserResponseDto,
  SessionResponseDto,
} from './dto/auth.dtos.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Post('login')
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Inicia sesión con email y contraseña. Better Auth maneja la autenticación. Para uso desde cliente web/móvil, se recomienda usar el SDK de Better Auth (better-auth client) que gestiona cookies y tokens automáticamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión iniciada exitosamente. Establece cookie de sesión.',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return { message: 'Use better-auth client SDK' };
  }

  @Post('register')
  @AllowAnonymous()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar usuario',
    description:
      'Registra un nuevo usuario en el sistema. Better Auth maneja la creación de usuario y sesión. Para uso desde cliente web/móvil, se recomienda usar el SDK de Better Auth.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente. Establece cookie de sesión.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o email ya registrado.',
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return { message: 'Use better-auth client SDK' };
  }

  @Post('refresh')
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refrescar token de acceso',
    description:
      'Refresca el token de sesión usando un refresh token. Mantiene la sesión activa sin necesidad de pedir credenciales nuevamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refrescado exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado.',
  })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return { message: 'Use better-auth client SDK' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Cierra la sesión del usuario actual. Elimina la cookie de sesión del cliente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente.',
  })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('better-auth.session_token');
    return { success: true, message: 'Sesión cerrada exitosamente' };
  }

  @Get('session')
  @ApiOperation({
    summary: 'Obtener sesión actual',
    description:
      'Retorna los datos del usuario autenticado actual y la información de su sesión. Útil para verificar si el usuario está logueado y obtener sus datos básicos (nombre, email, rol).',
  })
  @ApiResponse({
    status: 200,
    description:
      'Sesión obtenida exitosamente. Retorna datos del usuario o null si no hay sesión.',
  })
  @ApiResponse({ status: 401, description: 'No hay sesión activa.' })
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
