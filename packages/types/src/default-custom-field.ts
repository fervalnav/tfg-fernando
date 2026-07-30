export type CustomFieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'CLASSIFIER';

export type DefaultCustomFieldDto = {
  id: string;
  accountId: string;
  name: string;
  description: string | null;
  type: CustomFieldType;
  classifiers: string[];
  canSelectMultiple: boolean;
  automatic: boolean;
  aiPrompt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateDefaultCustomFieldPayload = {
  id: string;
  name: string;
  description?: string;
  type: CustomFieldType;
  classifiers?: string[];
  canSelectMultiple?: boolean;
  automatic?: boolean;
  aiPrompt?: string;
};

export type UpdateDefaultCustomFieldPayload = {
  name?: string;
  description?: string | null;
  type?: CustomFieldType;
  classifiers?: string[];
  canSelectMultiple?: boolean;
  automatic?: boolean;
  aiPrompt?: string | null;
};

export type CustomFieldValue = string | number | boolean | string[] | null;

export type CustomFieldDto = {
  id: string;
  accountId: string;
  opportunityId: string;
  defaultCustomFieldId: string;
  name: string;
  description: string | null;
  type: CustomFieldType;
  classifiers: string[];
  canSelectMultiple: boolean;
  automatic: boolean;
  aiPrompt: string | null;
  value: CustomFieldValue;
  aiStatus: AiGenerationStatus;
  aiError: string | null;
  aiEvidence: string | null;
  aiGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SetCustomFieldValuePayload = {
  value: Exclude<CustomFieldValue, null>;
};

export type AddCustomFieldToOpportunityPayload = {
  id: string;
  defaultCustomFieldId: string;
};
import type { AiGenerationStatus } from './ai';
