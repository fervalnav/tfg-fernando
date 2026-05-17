import { IsEmail, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ACCOUNT_MEMBER_ROLES } from '../../../domain/value-objects/account-member-role.value-object';

export class InviteMemberDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty({ enum: ACCOUNT_MEMBER_ROLES })
  @IsIn(ACCOUNT_MEMBER_ROLES)
  role!: 'ADMIN' | 'MEMBER';
}
