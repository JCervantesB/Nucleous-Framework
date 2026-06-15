import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AiService } from '../../application/ai.service';
import {
  GenerateTextDto,
  ChatDto,
  GenerateTextResponseDto,
  ChatResponseDto,
} from './dto/ai.dtos';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('completions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generar completación de texto',
    description:
      'Genera texto a partir de un prompt usando IA (OpenAI, Anthropic, etc.). Soporta modelos de completado como GPT-4, Claude, etc. Configurable con parámetros como temperatura, máximo de tokens, y prompt de sistema. Útil para generación de contenido, resúmenes, traducciones, etc.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Texto generado exitosamente. Retorna el texto generado, uso de tokens y modelo/provider usado.',
    type: () => GenerateTextResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Prompt vacío o parámetros inválidos.',
  })
  @ApiResponse({
    status: 401,
    description:
      'No autorizado - Token JWT inválido o ausente, o API key de IA no configurada.',
  })
  async generateText(@Body() dto: GenerateTextDto) {
    const result = await this.aiService.generateText({
      prompt: dto.prompt,
      provider: dto.provider,
      model: dto.model,
      modelAlias: dto.modelAlias as any,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
      systemPrompt: dto.systemPrompt,
    });

    return {
      text: result.text,
      usage: {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      },
      model: result.model,
      provider: result.provider,
    };
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chat con IA',
    description:
      'Mantiene una conversación con IA usando el formato de mensajes (rol: user/assistant/system). A diferencia de completions, chat mantiene contexto de la conversación. Soporta múltiples providers (OpenAI, Anthropic) y modelos (GPT-4, Claude, etc.).',
  })
  @ApiResponse({
    status: 200,
    description:
      'Respuesta generada exitosamente. Retorna el texto de la respuesta, uso de tokens y modelo/provider usado.',
    type: () => ChatResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Mensajes vacíos o parámetros inválidos.',
  })
  @ApiResponse({
    status: 401,
    description:
      'No autorizado - Token JWT inválido o ausente, o API key de IA no configurada.',
  })
  async chat(@Body() dto: ChatDto) {
    const result = await this.aiService.chat({
      messages: dto.messages,
      provider: dto.provider,
      model: dto.model,
      modelAlias: dto.modelAlias as any,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
    });

    return {
      text: result.text,
      usage: {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      },
      model: result.model,
      provider: result.provider,
    };
  }
}
