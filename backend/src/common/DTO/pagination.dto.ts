import {Min ,IsInt, Max } from 'class-validator'
import {Type} from 'class-transformer'


export class PaginationDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page : number = 1

    @Type(()=> Number)
    @IsInt()
    @Max(100)
    limit:  number = 1
}   