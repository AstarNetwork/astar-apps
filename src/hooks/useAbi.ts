import { ref } from 'vue';
import type { ChainProperties } from '@polkadot/types/interfaces';

import { Abi } from '@polkadot/api-contract';
import { AnyJson } from '@polkadot/types/types';
import { u8aToString } from '@polkadot/util';
import { useStore } from 'src/store';
import { useApi } from '.';

interface CodeBase {
  id: string;
  codeHash: string;
  name: string;
  genesisHash: string;
  tags: string[];
}
export interface Code extends CodeBase {
  abi?: AnyJson | null;
}

export interface FileState {
  data: Uint8Array;
  name: string;
  size: number;
}

// interface UseAbi {
//   abi: Abi | null;
//   errorText: string | null;
//   isAbiError: boolean;
//   isAbiValid: boolean;
//   isAbiSupplied: boolean;
//   onChangeAbi: (_: FileState) => void;
//   onRemoveAbi: () => void;
// }

interface AbiSpecOutdated {
  deploy?: any;
  messages?: any;
  registry?: {
    strings?: any;
  };
}

export default function useAbi(source: Code | null = null, isRequired = false) {
  const { api } = useApi();

  const registry = api?.value?.registry;
  const chainProperties = registry?.getChainProperties() as ChainProperties | undefined;

  const abi = source ? ref(new Abi(source?.abi, chainProperties)) : ref(null);
  const isAbiSupplied = ref(!!source?.abi);
  const isAbiValid = ref(!isRequired || !!source?.abi);

  const isAbiError = ref(false);
  const errorText = ref('');

  const store = useStore();

  const onChangeAbi = ({ data }: FileState): void => {
    const json = u8aToString(data);

    try {
      const abiOutdated = JSON.parse(json) as AbiSpecOutdated;

      if (abiOutdated.deploy || abiOutdated.messages) {
        throw new Error('You are using an ABI with an outdated format. Please generate a new one.');
      }

      const newAbi = JSON.parse(json) as AnyJson;

      //@ts-ignore
      abi.value = new Abi(newAbi, chainProperties);
      isAbiError.value = false;
      isAbiSupplied.value = true;
      isAbiValid.value = true;

      source?.codeHash &&
        store.dispatch('contracts/saveCode', {
          api: api?.value,
          _codeHash: source?.codeHash,
          partial: { abi: json },
        });
    } catch (error: any) {
      console.error(error);

      isAbiSupplied.value = false;
      isAbiValid.value = false;

      isAbiError.value = true;
      errorText.value = error;
    }
  };

  const onRemoveAbi = (): void => {
    isAbiSupplied.value = false;
    isAbiValid.value = false;

    isAbiError.value = false;

    source?.codeHash &&
      store.dispatch('contracts/saveCode', {
        api: api?.value,
        _codeHash: source?.codeHash,
        partial: { abi: null },
      });
  };

  return {
    abi,
    errorText,
    isAbiError,
    isAbiSupplied,
    isAbiValid,
    onChangeAbi,
    onRemoveAbi,
  };
}
