import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptors } from './common/interceptors/reseponse-interceptor.js';
import { HttpExceptionFilters } from './common/filters/htttp-exceptions.js';
import cookieParser from 'cookie-parser'
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  //validate input tu FE gui ve
  app.useGlobalPipes(new ValidationPipe({
    whitelist : true,
    transform : true,
    forbidNonWhitelisted : true
  }))
  //Format success response
  app.useGlobalInterceptors(new ResponseInterceptors())
  //Format HttpException Error
  app.useGlobalFilters(new HttpExceptionFilters())

    await app.listen(process.env.PORT ?? 5000);
}
await bootstrap();
