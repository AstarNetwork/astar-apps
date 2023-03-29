import type { ApiPromise } from '@polkadot/api';
import { ref } from 'vue';
import type { InjectedExtension } from '@polkadot/extension-inject/types';
import { web3Accounts } from '@polkadot/extension-dapp';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { getInjectedExtensions, isMobileDevice } from 'src/hooks/helper/wallet';
import { keyring } from '@polkadot/ui-keyring';
import { isTestChain } from '@polkadot/util';
import { wait } from '@astar-network/astar-sdk-core';

interface InjectedAccountExt {
  address: string;
  meta: {
    name: string;
    source: string;
    whenCreated: number;
  };
}

const loadAccounts = async (api: ApiPromise) => {
  await cryptoWaitReady();
  const [systemChain, injectedAccounts] = await Promise.all([
    api.rpc.system.chain() as any,
    web3Accounts().then((accounts): InjectedAccountExt[] =>
      accounts.map(
        ({ address, meta }, whenCreated): InjectedAccountExt => ({
          address,
          meta: {
            ...meta,
            name: `${meta.name} (
              ${meta.source === 'polkadot-js' ? 'extension' : meta.source})`,
            whenCreated,
          },
        })
      )
    ),
  ]);

  const isDevelopment = isTestChain(systemChain ? systemChain.toString() : '<unknown>');

  return {
    isDevelopment,
    injectedAccounts,
  };
};

export function useExtensions(api: ApiPromise, store: any) {
  let extensions = ref<InjectedExtension[]>();

  (async () => {
    try {
      if (isMobileDevice) {
        // MEMO: resolve the issue that do not sync accounts in nova wallet
        await wait(400);
      }
      const injectedPromise = await getInjectedExtensions(true);
      extensions.value = await injectedPromise;

      // MEMO: tricky way to fix this : after approving extension first, web3Accounts is not retrieving extension address to add
      const selectedAddress = localStorage.getItem(LOCAL_STORAGE.SELECTED_ADDRESS);
      if (!selectedAddress) {
        await loadAccounts(api);
      }
      const { isDevelopment, injectedAccounts } = await loadAccounts(api);

      keyring.loadAll(
        {
          genesisHash: api.genesisHash,
          isDevelopment,
          ss58Format: 5,
        },
        injectedAccounts
      );
    } catch (err) {
      console.error(err);
    }
  })();

  return {
    extensions,
  };
}
