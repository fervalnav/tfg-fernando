import { IsDefined } from 'class-validator';
import type { CustomFieldValue, SetCustomFieldValuePayload } from '@tfg/types';

export class SetCustomFieldValueDto implements SetCustomFieldValuePayload {
  @IsDefined()
  value!: Exclude<CustomFieldValue, null>;
}
