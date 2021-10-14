import { Abi } from '@polkadot/api-contract';

export interface CodeJson {
  abi?: string | null;
  codeHash: string;
  name: string;
  genesisHash: string;
  tags: string[];
  whenCreated: number;
}

export interface CodeStored {
  json: CodeJson;
  contractAbi?: Abi;
}

export type State = {
  allCode: Record<string, CodeStored>;
};

export interface ContractsStateInterface {
  allCode: any;
}

function state(): ContractsStateInterface {
  return {
    allCode: {},
  };
}

export default state;
