import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateOrganizationDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsArray()
    @IsNumber({allowInfinity: false, allowNaN: false}, {each: true})
    memberIds?: number[];
}

export class UpdateOrganizationDto {
    @IsOptional()
    @ApiProperty()
    @IsString()
    name?: string;

    @IsOptional()
    @ApiProperty()
    @IsArray()
    @IsNumber({allowInfinity: false, allowNaN: false}, {each: true})
    memberIds?: number[];
}

export class AddMemberDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber({allowInfinity: false, allowNaN: false})
    userId: number;
}