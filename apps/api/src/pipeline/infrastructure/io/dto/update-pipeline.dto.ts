import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePipelineDto {
  @ApiProperty() @IsString() @MinLength(1) name!: string;
}
