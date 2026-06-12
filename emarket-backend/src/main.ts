import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true, // 🔥 convert string -> number
    forbidNonWhitelisted: true, // 🔥 chặn field rác
    // transformOptions: {
    //   enableImplicitConversion: true // ← tự convert string -> đúng kiểu
    // }

  }));
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.use(cookieParser()); // Thêm dòng này
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "https://link-frontend-cua-ban.vercel.app",
    ],
    credentials: true,
  })
  await app.listen(process.env.PORT || 8000);

  console.log(`🚀 Server tại http://localhost:${process.env.PORT || 8000}`);
}
bootstrap();