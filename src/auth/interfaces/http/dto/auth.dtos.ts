import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, MaxLength, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email del usuario', example: 'usuario@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Contraseña', example: 'contraseña123' })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class RegisterDto {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'Email del usuario', example: 'usuario@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Contraseña', example: 'contraseña123' })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Token de actualización' })
  @IsString()
  refreshToken!: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Token de acceso' })
  token!: string;

  @ApiProperty({ description: 'Token de actualización' })
  refreshToken!: string;

  @ApiProperty({ description: 'Fecha de expiración' })
  expiresAt!: Date;

  @ApiProperty({ description: 'ID del usuario' })
  userId!: string;
}

export class UserResponseDto {
  @ApiProperty({ description: 'ID del usuario' })
  id!: string;

  @ApiProperty({ description: 'Nombre' })
  name!: string;

  @ApiProperty({ description: 'Email' })
  email!: string;

  @ApiPropertyOptional({ description: 'Rol del usuario' })
  role?: string;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt!: Date;
}

export class SessionResponseDto {
  @ApiProperty({ description: 'ID de la sesión' })
  sessionId!: string;

  @ApiProperty({ description: 'Fecha de expiración' })
  expiresAt!: Date;

  @ApiProperty({ description: 'ID del usuario' })
  userId!: string;

  @ApiProperty({ type: () => UserResponseDto, description: 'Datos del usuario' })
  user!: UserResponseDto;
}