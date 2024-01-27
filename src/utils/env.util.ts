import { ConfigService } from '@nestjs/config';

export class EnvUtil {
    constructor(private configService: ConfigService) {}

    /**
     * In dev environment create new database automatically
     */
    public isDebug(): boolean {
        if (
            this.configService.get<string>('NODE_ENV')?.includes('PROD') ||
            this.configService.get<string>('NODE_ENV')?.includes('prod')
        )
            return false;
        return true;
    }
}
