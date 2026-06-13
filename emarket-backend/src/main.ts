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
    origin: (origin, callback) => {
      // Cho phép localhost, mọi subdomain của vercel.app, và FRONTEND_URL từ biến môi trường
      const frontendUrl = process.env.FRONTEND_URL;
      if (
        !origin ||
        origin.startsWith('http://localhost') ||
        origin.endsWith('.vercel.app') ||
        (frontendUrl && origin === frontendUrl)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
  await app.listen(process.env.PORT || 8000);

  console.log(`🚀 Server tại http://localhost:${process.env.PORT || 8000}`);
}
bootstrap();