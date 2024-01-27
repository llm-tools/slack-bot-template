import { ExceptionFilter, Catch, ArgumentsHost, InternalServerErrorException, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

@Catch(Error)
export class ExceptionHandler implements ExceptionFilter {
    private readonly logger = new Logger(ExceptionHandler.name);

    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = (<any>exception).status || (<any>exception).statusCode || 400;

        if (exception instanceof QueryFailedError) {
            this.logger.error('Unhandled QueryFailedError bubbled up', exception.stack, exception.message);
            exception = new InternalServerErrorException();
        }

        if ((<any>exception).logger) delete (<any>exception).logger;
        response.status(status).json(exception);
    }
}
