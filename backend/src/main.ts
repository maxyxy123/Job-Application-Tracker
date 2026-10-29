import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptors } from './common/interceptors/reseponse-interceptor.js';
import { HttpExceptionFilters } from './common/filters/htttp-exceptions.js';
import cookieParser from 'cookie-parser' //must have de parse dc cookie
import { VersioningType } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //req.cookies.tenCookie phai co con doc lay dc cookie de validate
  app.use(cookieParser())

  //api versioning

  app.setGlobalPrefix("api")

  app.enableVersioning({
    type : VersioningType.URI,
    defaultVersion : "1"
  })

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
