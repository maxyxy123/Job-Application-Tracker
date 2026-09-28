import { Catch,HttpException,ExceptionFilter,ArgumentsHost } from "@nestjs/common";
import {Request , Response} from 'express'

//Bat tat ca HttpException
@Catch(HttpException)
export class HttpExceptionFilters implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost):void {
        //lay response va request
        const context = host.switchToHttp()
        const response = context.getResponse<Response>()
        const request =context.getRequest<Request>()

        //Lay statusCode
        const statusCode = exception.getStatus()

        response.status(statusCode).json({
            success :false ,
            statusCode : statusCode,
            message : exception.message,
            path : request.url,
            timeStamp : new Date().toISOString()
             
        })
    }
}