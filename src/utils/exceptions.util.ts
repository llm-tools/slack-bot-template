import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

@Catch(Error)
export class ExceptionHandler implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = (<any>exception).status || (<any>exception).statusCode || 400;

        if ((<any>exception).logger) delete (<any>exception).logger;
        response.status(status).json(exception);
    }
}
