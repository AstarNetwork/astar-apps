import type { ApiPromise } from '@polkadot/api';
import { ref } from 'vue';
import type { InjectedExtension } from '@polkadot/extension-inject/types';
import { web3Accounts } from '@polkadot/extension-dapp';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { getInjectedExtensions } from 'src/hooks/helper/wallet';
import { keyring } from '@polkadot/ui-keyring';
import { objToArray } from 'src/hooks/helper/common';
import { isTestChain } from '@polkadot/util';

interface InjectedAccountExt {
  address: string;
  meta: {
    name: string;
    source: string;
    whenCreated: number;
  };
}

const loadAccounts = async (api: ApiPromise): Promise<void> => {
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

  keyring.loadAll(
    {
      genesisHash: api.genesisHash,
      isDevelopment,
      ss58Format: 5,
    },
    injectedAccounts
  );
};

export function useExtensions(api: ApiPromise, store: any) {
  let extensions = ref<InjectedExtension[]>();

  (async () => {
    try {
      const injectedPromise = await getInjectedExtensions(true);
      extensions.value = await injectedPromise;

      await loadAccounts(api);

      keyring.accounts.subject.subscribe((accounts) => {
        if (accounts) {
          const accountArray = objToArray(accounts);
          const accountMap = accountArray.map((account) => {
            const { address, meta } = account.json;
            return {
              address,
              name: meta.name.replace('\n              ', ''),
              source: meta.source,
            };
          });

          store.commit('general/setSubstrateAccounts', accountMap);
        }
      });
    } catch (err) {
      console.error(err);
    }
  })();

  return {
    extensions,
  };
}
