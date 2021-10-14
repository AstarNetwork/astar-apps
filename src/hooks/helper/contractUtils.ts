import type { AnyJson } from '@polkadot/types/types';
import type { AbiMessage } from '@polkadot/api-contract/types';
import type { KeyringItemType, KeyringJson$Meta } from '@polkadot/ui-keyring/types';
import { keyring } from '@polkadot/ui-keyring';

import { Abi, ContractPromise as Contract } from '@polkadot/api-contract';
import { ApiPromise } from '@polkadot/api';

function getAddressMeta(address: string, type: KeyringItemType | null = null): KeyringJson$Meta {
  let meta: KeyringJson$Meta | undefined;

  try {
    const pair = keyring.getAddress(address, type);

    meta = pair && pair.meta;
  } catch (error) {
    // we could pass invalid addresses, so it may throw
  }

  return meta || {};
}

function getContractAbi(address: string | null, api: ApiPromise): Abi | null {
  if (!address) {
    return null;
  }

  let abi: Abi | undefined;
  const meta = getAddressMeta(address, 'contract');

  try {
    const data = meta.contract && (JSON.parse(meta.contract.abi) as AnyJson);

    abi = new Abi(data, api.registry.getChainProperties());
  } catch (error) {
    console.error(error);
  }

  return abi || null;
}

export function findCallMethod(
  callContract: Contract | null,
  callMethodIndex = 0
): AbiMessage | null {
  const message = callContract && callContract.abi.messages[callMethodIndex];

  return message || null;
}

export function getContractMethodFn(
  callContract: Contract | null,
  callMethodIndex: number | null
): AbiMessage | null {
  const fn =
    callContract &&
    callContract.abi &&
    callMethodIndex !== null &&
    callContract.abi.messages[callMethodIndex];

  return fn || null;
}

export function getContractForAddress(api: ApiPromise, address: string | null): Contract | null {
  if (!address) {
    return null;
  } else {
    const abi = getContractAbi(address, api);

    return abi ? new Contract(api, abi, address) : null;
  }
}
