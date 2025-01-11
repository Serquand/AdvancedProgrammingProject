import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerDTO {
    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    questionId: number;

    @ApiProperty()
    @IsOptional()
    value: any;
}

export class SubmitAnswersDTO {
    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDTO)
    answers: AnswerDTO[];

    @ApiProperty()
    @IsBoolean()
    acceptReview: boolean;
}