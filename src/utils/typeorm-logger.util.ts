import { Logger as CommonLogger } from '@nestjs/common';
import { Logger } from 'typeorm';

export class TypeormLogger implements Logger {
    private readonly logger = new CommonLogger(TypeormLogger.name);

    logQuery(query: string, parameters?: any[]) {
        const sql =
            query + (parameters && parameters.length ? ' -- PARAMETERS: ' + this.stringifyParams(parameters) : '');
        this.logger.debug(sql);
    }

    logQueryError(error: string, query: string, parameters?: any[]) {
        const sql =
            query + (parameters && parameters.length ? ' -- PARAMETERS: ' + this.stringifyParams(parameters) : '');
        this.logger.error(sql);
    }

    logQuerySlow(time: number, query: string, parameters?: any[]) {
        const sql =
            query + (parameters && parameters.length ? ' -- PARAMETERS: ' + this.stringifyParams(parameters) : '');
        this.logger.log(sql);
    }

    logSchemaBuild(message: string) {
        this.logger.debug(message);
    }

    logMigration(message: string) {
        this.logger.debug(message);
    }

    log(level: 'log' | 'info' | 'warn', message: any) {
        switch (level) {
            case 'log':
            case 'info':
                this.logger.log(message);
                break;
            case 'warn':
                this.logger.warn(message);
                break;
        }
    }

    protected stringifyParams(parameters: any[]) {
        try {
            return JSON.stringify(parameters);
        } catch (error) {
            // most probably circular objects in parameters
            return parameters;
        }
    }
}
