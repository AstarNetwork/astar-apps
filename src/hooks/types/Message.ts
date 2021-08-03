import type { TypeDef } from '@polkadot/types/create/types';
import type { AbiParam } from '@polkadot/api-contract/types';

export interface MessageType {
  identifier: string;
  docs: string[];
  args: AbiParam[];
  returnType?: TypeDef | null;
  isConstructor?: boolean;
  index: number;
}
