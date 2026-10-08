import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
    const message = typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse ? exceptionResponse.message : exception instanceof HttpException ? exceptionResponse : 'Internal server error';
    const requestId = String(request.headers['x-request-id'] || randomUUID());
    response.setHeader('x-request-id', requestId);
    response.status(status).json({ statusCode: status, message, error: HttpStatus[status] || 'Error', timestamp: new Date().toISOString(), path: request.url, requestId });
  }
}
