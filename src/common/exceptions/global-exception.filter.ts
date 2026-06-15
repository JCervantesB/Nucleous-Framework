import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

interface ValidationError {
  field: string;
  message: string;
}

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: ValidationError[];
  timestamp: string;
  path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let details: ValidationError[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || exception.message;

        if (Array.isArray(responseObj.message)) {
          details = responseObj.message.map((msg: string) => ({
            field: 'unknown',
            message: msg,
          }));
          message = 'Validation failed';
        }
      } else {
        message = String(exceptionResponse);
      }
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      error: HttpStatus[status],
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (details) {
      errorResponse.details = details;
    }

    response.status(status).json(errorResponse);
  }
}