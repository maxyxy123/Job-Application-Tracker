import {IsString , IsEmail , MinLength, Length} from 'class-validator'

export class RegisterDto  {

    @IsString()
    @Length(3,20)
    name : string

    @IsEmail()
    email : string

    @IsString()
    @MinLength(8)
    password:string
}

export class LoginDto {
    @IsEmail()
    email : string

    @IsString()
    @MinLength(8)
    password:string
}