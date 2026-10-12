import { Catch,HttpException,ExceptionFilter,ArgumentsHost } from "@nestjs/common";
import {Request , Response} from 'express'

type ExceptionResponse = {
    message : string | string[]
}

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
        const exceptionResponse = exception.getResponse() as ExceptionResponse | string
        let message;

        if(typeof exceptionResponse === "string"){
            message = exceptionResponse
        }else{
            message = exceptionResponse.message
        }

        response.status(statusCode).json({
            success :false ,
            statusCode : statusCode,
            message  : message,
            path : request.url,
            timeStamp : new Date().toISOString()
             
        })
    }
}