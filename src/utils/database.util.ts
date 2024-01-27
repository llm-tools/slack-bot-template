import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { createConnection } from 'mysql2/promise';
import { ConfigService } from '@nestjs/config';

import { EnvUtil } from './env.util.js';
import { Entities, Migrations } from '../orm/index.js';
import { TypeormLogger } from './typeorm-logger.util.js';

@Injectable()
export class DatabaseUtil {
    private readonly logger = new Logger(DatabaseUtil.name);

    private envUtil: EnvUtil;

    constructor(private configService: ConfigService) {
        this.envUtil = new EnvUtil(configService);
    }

    /**
     * Returns the array of values
     *
     * @param Obj - It has multiple key - value pairs
     */
    private getObjectValues<T>(obj: { [key: string]: T }): T[] {
        return Object.keys(obj).map((key) => obj[key]);
    }

    /**
     * In dev environment create new database automatically
     */
    private async createDatabase(): Promise<void> {
        const mysqlConnection = await createConnection({
            connectionLimit: 1,
            host: this.configService.get<string>('DB_HOST'),
            password: this.configService.get<string>('DB_PASSWORD'),
            port: this.configService.get<number>('DB_PORT'),
            user: this.configService.get<string>('DB_USERNAME'),
            waitForConnections: true,
        });

        try {
            await mysqlConnection.query(`CREATE DATABASE \`${this.configService.get<string>('DB_DATABASE')}\``);
            this.logger.debug(`New DB created with name \`${this.configService.get<string>('DB_DATABASE')}\`!`);
        } catch {
            // DO NOTHING; DB already exists...
        } finally {
            mysqlConnection.destroy();
        }
    }

    /**
     * Initialize the MariaDB connection
     */
    async initDatabase(): Promise<TypeOrmModuleOptions> {
        if (this.envUtil.isDebug()) await this.createDatabase();

        const entities = this.getObjectValues(Entities);
        const migrations = this.getObjectValues(Migrations);

        return {
            // charset: 'utf8mb4',
            database: this.configService.get<string>('DB_DATABASE'),
            entities,
            entityPrefix: this.configService.get<string>('DB_TABLE_PREFIX'),
            host: this.configService.get<string>('DB_HOST'),
            logger: new TypeormLogger(),
            logging: this.envUtil.isDebug() ? 'all' : ['error'],
            maxQueryExecutionTime: 1000,
            migrations,
            password: this.configService.get<string>('DB_PASSWORD'),
            port: this.configService.get<number>('DB_PORT'),
            synchronize: this.envUtil.isDebug(),
            type: 'mariadb',
            username: this.configService.get<string>('DB_USERNAME'),
            migrationsRun: false, //this.envUtil.isDebug(),
            extra: {
                decimalNumbers: true,
            },
        };
    }
}
