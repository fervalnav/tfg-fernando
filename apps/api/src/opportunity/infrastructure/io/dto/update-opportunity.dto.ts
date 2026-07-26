import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Length, Min, MinLength } from 'class-validator';

export class UpdateOpportunityDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MinLength(1) title?: string;
  @ApiProperty({ required: false, nullable: true }) @IsOptional() @IsString() description?: string | null;
  @ApiProperty({ required: false, nullable: true }) @IsOptional() @IsNumber() @Min(0) amount?: number | null;
  @ApiProperty({ required: false, nullable: true }) @IsOptional() @IsString() @Length(3, 3) currency?: string | null;
  @ApiProperty({ required: false, nullable: true }) @IsOptional() @IsDateString() dueDate?: string | null;
}
