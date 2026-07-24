import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWorkflowDto {
  @ApiProperty() @IsString() @MinLength(1) name!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}
