import type { ApiPromise } from '@polkadot/api';
import type { MetadataDef } from '@polkadot/extension-inject/types';
import { getSpecTypes } from '@polkadot/types-known';
import { TypeRegistry } from '@polkadot/types/create';
import { formatBalance, isNumber } from '@polkadot/util';
import { defaults as addressDefaults } from '@polkadot/util-crypto/address/defaults';
import { ASTAR_NATIVE_TOKEN } from 'src/config/chain';
import { useChainMetadata } from 'src/hooks/useChainMetadata';
import { ref } from 'vue';

export interface ChainInfo extends MetadataDef {
  color: string | undefined;
  tokenSymbol: ASTAR_NATIVE_TOKEN;
}

const registry = new TypeRegistry();

export const DEFAULT_DECIMALS = registry.createType('u32', 12);
export const DEFAULT_SS58 = registry.createType('u32', addressDefaults.prefix);

function createInfo(api: ApiPromise, systemChain: string, specName: string): ChainInfo {
  // console.log('chainInfo', `${systemChain} | ${systemName} | ${specName}`);
  return {
    chain: systemChain,
    color: '#2096F3',
    genesisHash: api.genesisHash.toHex(),
    icon: 'polkadot',
    metaCalls: Buffer.from(api.runtimeMetadata.asCallsOnly.toU8a()).toString('base64'),
    specVersion: api.runtimeVersion.specVersion.toNumber(),
    ss58Format: isNumber(api.registry.chainSS58) ? api.registry.chainSS58 : DEFAULT_SS58.toNumber(),
    tokenDecimals: (api.registry.chainDecimals || [DEFAULT_DECIMALS.toNumber()])[0],
    tokenSymbol: (api.registry.chainTokens ||
      formatBalance.getDefaults().unit)[0] as ASTAR_NATIVE_TOKEN,
    types: getSpecTypes(
      api.registry,
      systemChain,
      api.runtimeVersion.specName,
      api.runtimeVersion.specVersion
    ) as unknown as Record<string, string>,
  };
}

export function useChainInfo(api: ApiPromise) {
  useChainMetadata();
  const chainInfo = ref<ChainInfo>();

  api.isReady.then(async () => {
    const specName: string = api.runtimeVersion.specName.toString();
    const systemChain: string = ((await api.rpc.system.chain()) || '<unknown>').toString();
    chainInfo.value = createInfo(api, systemChain, specName);
  });

  return {
    chainInfo,
  };
}
