import { BlockType } from "./BlockType";

export type Block = {
  name: string;
  token_id: string;
  token_uri: string;
  id: number;
  type: BlockType;
  count: number;
  object_id: string;
};