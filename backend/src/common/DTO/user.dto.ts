import {IsString , Min, MinLength} from 'class-validator'



export class PasswordDto  {
    @IsString()
    @MinLength(8)
    currentPassword : string


    @IsString()
    @MinLength(8)
    newPassword : string
}