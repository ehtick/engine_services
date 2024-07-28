import { Item, ItemVersion } from './items';

export type CreateItemResponse<T = Item> = {
  item: T;
  version: ItemVersion;
};

export type UpdateItemResponse<T = Item> = {
  item?: T;
  version?: ItemVersion;
};
