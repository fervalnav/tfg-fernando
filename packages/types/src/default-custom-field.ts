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
