import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptors } from './common/interceptors/reseponse-interceptor.js';
import { HttpExceptionFilters } from './common/filters/htttp-exceptions.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
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
}
await bootstrap();
