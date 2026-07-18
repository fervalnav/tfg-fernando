export type OutcomeType = 'NONE' | 'WON' | 'LOST' | 'DROPPED';

export type PipelineStatusDto = {
  id: string;
  pipelineId: string;
  name: string;
  description: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  isInitial: boolean;
  isTerminal: boolean;
  outcomeType: OutcomeType;
  showInKanban: boolean;
  sortPoints: number;
  createdAt: string;
  updatedAt: string;
};

export type PipelineDto = {
  id: string;
  name: string;
  statuses: PipelineStatusDto[];
  createdAt: string;
};

export type CreatePipelinePayload = {
  id: string;
  name: string;
};

export type UpdatePipelinePayload = {
  name: string;
};

export type CreatePipelineStatusPayload = {
  id: string;
  name: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
  isTerminal?: boolean;
  outcomeType?: OutcomeType;
  showInKanban?: boolean;
};

export type UpdatePipelineStatusPayload = Partial<Omit<CreatePipelineStatusPayload, 'id'>>;

export type ReorderPipelineStatusesPayload = {
  ids: string[];
};
