import { IsEmail, IsString, Matches, MinLength, MaxLength, IsEnum } from 'class-validator';
import { UserRoles } from '../schemas';
import { ApiProperty } from '@nestjs/swagger';

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export class CreateUserDto {
    @ApiProperty()
    @IsEmail()
    @MaxLength(100)
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    @Matches(passwordRegex, { message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character' })
    password: string;

    @ApiProperty()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    firstName: string;

    @ApiProperty()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    lastName: string;

    @IsEnum(UserRoles)
    role: UserRoles;
}

export class UpdateUserDto {
    @ApiProperty()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    firstName: string;

    @ApiProperty()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    lastName: string;

    @ApiProperty()
    @IsEnum(UserRoles)
    role: UserRoles;
}