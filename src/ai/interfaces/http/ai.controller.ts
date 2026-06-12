import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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
  @ApiOperation({ summary: 'Generar completación de texto' })
  @ApiResponse({ status: 200, type: () => GenerateTextResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
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
  @ApiOperation({ summary: 'Chat con IA' })
  @ApiResponse({ status: 200, type: () => ChatResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
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