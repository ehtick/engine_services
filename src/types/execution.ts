import { ObjectId } from './base';
import { Base } from './base';

export type ExecutionEntity = Base & {
  toolId: ObjectId;
  toolVersion: string;
  progress: number;
  result?: ExecutionResultType;
  resultMessage?: string;
  messages?: ExecutionMessageEntity[];
};

export type ExecutionMessageEntity = Base & {
  executionId: ObjectId;
  content: string;
};

export type ExecutionResultType = 'SUCCESS' | 'ERROR' | 'WARNING';

export type ExecutionSuscriptionReturnType = {
  progressUpdate?: ExecutionEntity;
  messageUpdate?: ExecutionMessageEntity;
};
