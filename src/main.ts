import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './modules/app/app.module.js';
import { ExceptionHandler } from './utils/exceptions.util.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true, rawBody: true });
    const config = app.get(ConfigService);

    app.useLogger(app.get(Logger));
    app.useGlobalInterceptors(new LoggerErrorInterceptor());
    app.useGlobalFilters(new ExceptionHandler());
    // app.useGlobalGuards(app.get(AuthGuard));
    app.enableCors({
        origin: '*',
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    if (config.get('GLOBAL_PATH_PREFIX')) {
        app.setGlobalPrefix(config.get('GLOBAL_PATH_PREFIX'));
    }

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Slack Bot')
        .setContact('Adhityan', 'https://adhityan.com/', 'me@adhityan.com')
        .setDescription('This is a slack bot that can answer questions using the EmbedJs RAG framework')
        .addBearerAuth(
            {
                description: `Please enter token in following format: Bearer <JWT>`,
                name: 'authorization',
                bearerFormat: 'Bearer',
                scheme: 'Bearer',
                type: 'http',
                in: 'Header',
            },
            'authentication',
        )
        .setVersion('0.0.1')
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${config.get('GLOBAL_PATH_PREFIX') ?? ''}swagger`, app, document);

    const PORT = config.get('PORT') || 9000;
    await app.listen(PORT);

    if (config.get('NGROK_AUTHTOKEN')) {
        import('@ngrok/ngrok').then((ngrok) => {
            ngrok
                .connect({
                    addr: PORT,
                    authtoken: config.get('NGROK_AUTHTOKEN'),
                    hostname: config.get('NGROK_HOSTNAME'),
                })
                .then((listener) => console.log(`Ingress established at: ${listener.url()}`));
        });
    }
}

bootstrap();
