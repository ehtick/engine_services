import { Readable } from 'stream';
import { ObjectId } from './base';

export type FileType = string | Uint8Array | Buffer | Readable;

export type HiddenFileEntity = {
  fileId: string;
  _id: ObjectId;
  parentItemId: ObjectId;
};

export type CreateHiddenItemResult = {
  hiddenFileId: string;
};
