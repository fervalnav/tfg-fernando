import { IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePipelineDto {
  @ApiProperty() @IsUUID('all') id!: string;
  @ApiProperty() @IsString() @MinLength(1) name!: string;
}
