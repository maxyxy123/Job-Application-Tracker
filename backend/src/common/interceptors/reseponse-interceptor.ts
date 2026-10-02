import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
@Injectable()
export class ResponseInterceptors<T> implements NestInterceptor {
  //context : THong tin ve request hien tai
  //next :cho phep request chay tiep
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    //lay response de gan cho status code
    const response = context.switchToHttp().getResponse();
    //transform Data de cho no chay tiep
    return next.handle().pipe(
      map((data: T) => {
        return {
          success: true,
          statusCode: response.statusCode,
          data,
        };
      }),
    );
  }
}
