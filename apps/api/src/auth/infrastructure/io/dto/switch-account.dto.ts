import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SwitchAccountDto {
  @ApiProperty() @IsUUID('all') accountId!: string;
}
