import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkflowDto {
  @ApiProperty() @IsUUID('all') id!: string;
  @ApiProperty() @IsString() @MinLength(1) name!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}
