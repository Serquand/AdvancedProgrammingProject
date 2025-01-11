import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, IsArray, IsEnum, IsInt, IsOptional, ValidateIf, ValidateNested, IsBoolean, IsNumber, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate } from "class-validator";
import { FieldType } from '../schemas/FormField.entity';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: 'isMaxGreaterThanMin', async: false })
export class IsMaxGreaterThanMinConstraint implements ValidatorConstraintInterface {
    validate(maxValue: number, args: ValidationArguments) {
        const dto = args.object as any;
        return maxValue > dto.minValue;
    }

    defaultMessage(args: ValidationArguments) {
        return `maxValue (${args.value}) doit être supérieur à minValue (${(args.object as any).minValue})`;
    }
}

@ValidatorConstraint({ name: 'BothOrNone', async: false })
export class BothOrNoneConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const dto = args.object as any;
        const minValue = dto.minValue;
        const maxValue = dto.maxValue;

        if ((minValue !== undefined && maxValue === undefined) || (maxValue !== undefined && minValue === undefined)) {
            return false;
        }

        return true;
    }

    defaultMessage() {
        return `Les champs 'minValue' et 'maxValue' doivent être définis ensemble ou laissés vides.`;
    }
}

export class CreateSurveyDto {
    @ApiProperty()
    @IsString()
    @MaxLength(256)
    title: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsNumber()
    organizationId: number;

    @ApiProperty()
    @IsBoolean()
    isPublic: boolean;
}

export class UpdateSurveyDto {
    @IsOptional()
    @ApiProperty()
    @IsString()
    @MaxLength(256)
    title: string;

    @IsOptional()
    @ApiProperty()
    @IsString()
    description: string;

    @IsOptional()
    @ApiProperty()
    @IsNumber()
    organizationId: number;

    @IsOptional()
    @ApiProperty()
    @IsBoolean()
    isPublic: boolean;
}

export class SelectChoiceDto {
    @ApiProperty({ description: "Label du choix", example: "Option 1" })
    @IsString({ message: 'Chaque choix doit avoir un label de type string.' })
    @MaxLength(256, { message: 'Le label du choix ne doit pas dépasser 256 caractères.' })
    label: string;
}

export class CreateFieldDto {
    @ApiProperty({ enum: FieldType, description: "Type de champ", example: FieldType.SELECT })
    @IsEnum(FieldType, { message: 'fieldType doit être une valeur valide de FieldType.' })
    fieldType: FieldType;

    @ApiProperty({ description: "Label du champ", example: "Nom", maxLength: 256 })
    @IsString({ message: 'label doit être une chaîne de caractères.' })
    @MaxLength(256, { message: 'label ne doit pas dépasser 256 caractères.' })
    label: string;

    @ApiProperty({ description: "Indique si le champ est obligatoire", example: true })
    @IsOptional()
    @IsBoolean({ message: 'required doit être de type booléen sous forme de chaîne.' })
    required?: boolean;

    @ApiProperty({ description: "Ordre du champ", example: 1 })
    @IsInt({ message: 'order doit être un entier.' })
    order: number;

    @ValidateIf((dto) => dto.fieldType === FieldType.SELECT)
    @ApiProperty({ description: "Nombre maximal de choix possibles (uniquement pour SELECT ou CHECKBOX)", example: 3 })
    @IsOptional()
    @IsInt({ message: 'maximalNumberOfChoices doit être un entier.' })
    maximalNumberOfChoices?: number;

    @ValidateIf((dto) => dto.fieldType === FieldType.NUMBER)
    @IsNumber()
    @ApiProperty({ description: "Valeur minimale pour le nombre", example: 0 })
    minValue: number;

    @ValidateIf((dto) => dto.fieldType === FieldType.NUMBER)
    @IsNumber()
    @Validate(IsMaxGreaterThanMinConstraint)
    @ApiProperty({ description: "Valeur minimale pour le nombre", example: 0 })
    maxValue: number;

    @ApiProperty({
        description: "Liste des choix (uniquement pour SELECT)",
        type: [SelectChoiceDto],
        example: [
            { label: "Option 1", value: "option_1" },
            { label: "Option 2", value: "option_2" }
        ]
    })
    @ValidateIf((dto) => dto.fieldType === FieldType.SELECT)
    @IsArray({ message: 'choices doit être un tableau.' })
    @ValidateNested({ each: true })
    @Type(() => SelectChoiceDto)
    choices?: SelectChoiceDto[];
}

export class UpdateFieldDto {
    @IsOptional()
    @ApiProperty({ enum: FieldType, description: "Type de champ", example: FieldType.SELECT })
    @IsEnum(FieldType, { message: 'fieldType doit être une valeur valide de FieldType.' })
    fieldType: FieldType;

    @IsOptional()
    @IsNumber()
    @ApiProperty({ description: "Valeur minimale pour le nombre", example: 0 })
    minValue: number;

    @IsOptional()
    @IsNumber()
    @Validate(IsMaxGreaterThanMinConstraint)
    @ApiProperty({ description: "Valeur minimale pour le nombre", example: 0 })
    maxValue: number;

    @Validate(BothOrNoneConstraint)
    bothOrNone: boolean;

    @IsOptional()
    @ApiProperty({ description: "Label du champ", example: "Nom", maxLength: 256 })
    @IsString({ message: 'label doit être une chaîne de caractères.' })
    @MaxLength(256, { message: 'label ne doit pas dépasser 256 caractères.' })
    label: string;

    @IsOptional()
    @ApiProperty({ description: "Indique si le champ est obligatoire", example: true })
    @IsOptional()
    @IsBoolean({ message: 'required doit être de type booléen sous forme de chaîne.' })
    required?: boolean;

    @IsOptional()
    @ApiProperty({ description: "Ordre du champ", example: 1 })
    @IsInt({ message: 'order doit être un entier.' })
    order: number;

    @ValidateIf((dto) => dto.fieldType === FieldType.SELECT)
    @ApiProperty({ description: "Nombre maximal de choix possibles (uniquement pour SELECT ou CHECKBOX)", example: 3 })
    @IsOptional()
    @IsInt({ message: 'maximalNumberOfChoices doit être un entier.' })
    maximalNumberOfChoices?: number;

    @IsOptional()
    @ApiProperty({
        description: "Liste des choix (uniquement pour SELECT)",
        type: [SelectChoiceDto],
        example: [
            { label: "Option 1", value: "option_1" },
            { label: "Option 2", value: "option_2" }
        ]
    })
    @ValidateIf((dto) => dto.fieldType === FieldType.SELECT)
    @IsArray({ message: 'choices doit être un tableau.' })
    @ValidateNested({ each: true })
    @Type(() => SelectChoiceDto)
    choices?: SelectChoiceDto[];
}