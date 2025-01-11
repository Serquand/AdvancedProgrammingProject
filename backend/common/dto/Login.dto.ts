import { IsEmail, IsString, Matches, MinLength, MaxLength, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { passwordRegex } from './User.dto';

export class LoginDto {
    @ApiProperty()
    @IsEmail()
    @MaxLength(100, { message: "User not found !" })
    email: string;

    @ApiProperty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsBoolean()
    rememberMe: boolean;
}

export class ForgotPasswordDto {
    @ApiProperty()
    @IsEmail()
    @MaxLength(100)
    email: string;
}

export class ResetPasswordDto {
    @ApiProperty()
    @IsString()
    @MinLength(8)
    @Matches(passwordRegex, { message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character' })
    password: string;

    @ApiProperty()
    @IsEmail()
    @MaxLength(100)
    email: string;

    @ApiProperty()
    @IsString()
    token: string;
}