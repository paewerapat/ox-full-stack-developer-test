import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  const frontendUrl = configService.get<string>('frontend.url');

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  await app.listen(port ?? 3001);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
