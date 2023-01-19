import { ISubmittableResult } from '@polkadot/types/types';
import { BN, u8aToHex } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import { $api } from 'boot/api';
import {
  useCurrentEra,
  useCustomSignature,
  useGasPrice,
  useNetworkInfo,
  RewardDestination,
} from 'src/hooks';
import { TxType } from 'src/hooks/custom-signature/message';
import { ExtrinsicPayload } from 'src/hooks/helper';
import { getIndividualClaimTxs, PayloadWithWeight } from 'src/hooks/helper/claim';
import { getAPI } from 'src/hooks/helper/oakUtils';
import { getInjector } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { hasExtrinsicFailedEvent } from 'src/store/dapp-staking/actions';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { autoStakingConfig } from 'src/config/autoStaking';
import { computed, ref, watchEffect } from 'vue';

const MAX_BATCH_WEIGHT = new BN('50000000000');
// TODO: move to config
const oakEndpoint = 'wss://rpc.turing-staging.oak.tech';

function getProxyAccount(api: any, address: string, paraId: number) {
  const decodedAddress = decodeAddress(address); // An Int array presentation of the address’ ss58 public key

  const location = {
    parents: 1, // From Turing to Mangata
    interior: {
      X2: [
        { Parachain: paraId },
        {
          AccountId32: {
            network: 'Any',
            id: u8aToHex(decodedAddress),
          },
        },
      ],
    },
  };

  const multilocation = api.createType('XcmV1MultiLocation', location);

  const toHash = new Uint8Array([
    ...new Uint8Array([32]),
    ...new TextEncoder().encode('multiloc'),
    ...multilocation.toU8a(),
  ]);

  const DescendOriginAddress32 = u8aToHex(api.registry.hash(toHash).slice(0, 32));

  return DescendOriginAddress32;
}

// TODO: fix
function isEmpty(obj: any) {
  return Object.keys(obj).length === 0;
}

export function useAutoCompound() {
  let batchTxs: PayloadWithWeight[] = [];
  const isLoadingAutoCompound = ref<boolean>(true);
  const store = useStore();
  const senderAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const isSendingTx = computed(() => store.getters['general/isLoading']);
  const { currentNetworkIdx } = useNetworkInfo();
  const { nativeTipPrice } = useGasPrice();
  const selfParaId = computed(() => autoStakingConfig[currentNetworkIdx.value].selfParaId);
  const oakParaId = computed(() => autoStakingConfig[currentNetworkIdx.value].oakParaId);
  const oakEndpoint = computed(() => autoStakingConfig[currentNetworkIdx.value].oakEndpoint);
  const oakSS58Prefix = computed(() => autoStakingConfig[currentNetworkIdx.value].oakSS58Prefix);
  const { era } = useCurrentEra();
  const { handleResult } = useCustomSignature({
    txType: TxType.dappsStaking,
  });

  watchEffect(async () => {
    try {
      isLoadingAutoCompound.value = true;
      const api = $api;
      const senderAddressRef = senderAddress.value;
      if (!api) {
        throw Error('Failed to connect to API');
      }
      if (!senderAddressRef || !era.value || isSendingTx.value) {
        return;
      }

      const txs = await Promise.all(
        dapps.value.map(async (it) => {
          if (it.dapp && !isH160.value) {
            const transactions = await getIndividualClaimTxs({
              dappAddress: it?.dapp?.address,
              api,
              senderAddress: senderAddressRef,
              currentEra: era.value,
            });
            return transactions.length ? transactions : null;
          } else {
            return null;
          }
        })
      );
      const filteredTxs = txs.filter((it) => it !== null);
      batchTxs = filteredTxs.flat() as PayloadWithWeight[];
    } catch (error: any) {
      console.error(error.message);
    } finally {
      isLoadingAutoCompound.value = false;
    }
  });

  const compoundAll = async (): Promise<void> => {
    const api = $api;
    const batchTxsRef = batchTxs;
    const oakAPI = await getAPI(oakEndpoint.value);

    const txResHandler = async (result: ISubmittableResult): Promise<boolean> => {
      const res = await handleResult(result);
      hasExtrinsicFailedEvent(result.events, store.dispatch);
      return res;
    };

    if (!api) {
      throw Error('Failed to connect to API');
    }
    if (0 >= batchTxsRef.length) {
      throw Error('No dApps can be claimed');
    }

    const txsToExecute: ExtrinsicPayload[] = [];
    for (let i = 0; i < batchTxsRef.length; i++) {
      const tx = batchTxsRef[i];

      txsToExecute.push(tx.payload as ExtrinsicPayload);
    }

    txsToExecute.unshift(api.tx.dappsStaking.setRewardDestination(RewardDestination.FreeBalance));
    txsToExecute.push(api.tx.dappsStaking.setRewardDestination(RewardDestination.StakeBalance));

    console.info(`Transactions no. ${txsToExecute.length}`);
    const proxyExtrinsic = api.tx.utility.batch(txsToExecute);

    const injector = await getInjector(substrateAccounts.value);
    if (!injector) {
      throw Error('Invalid injector');
    }

    const address = senderAddress.value;
    const proxyCall = api.tx.proxy.proxy(address, 'Any', proxyExtrinsic);
    const encodedProxyCall = proxyCall.method.toHex();
    const proxyCallFees = await proxyCall.paymentInfo(address);

    // If there is no proxy, add proxy.
    const proxiesResponse = await api.query.proxy.proxies(address);

    if (isEmpty(proxiesResponse)) {
      const proxyAddress = getProxyAccount(api, address, oakParaId.value);
      const proxyTxn = api.tx.proxy.addProxy(proxyAddress, 'Any', 0);

      // TODO: add tip, show error
      await proxyTxn.signAndSend(
        address,
        {
          signer: injector.signer,
          nonce: -1,
        },
        (result) => {
          (async () => {
            const res = await txResHandler(result);
          })();
        }
      );
    }

    // Schedule XCM call
    const providedId = `xcmp_astar_automation_${(Math.random() + 1).toString(36).substring(7)}`;
    const xcmpCall = oakAPI.tx.automationTime.scheduleXcmpTask(
      providedId,
      [Math.floor(Date.now() / 1000) + 24 * 60 * 60], // TODO: calculate execution time
      selfParaId.value,
      0,
      encodedProxyCall,
      proxyCallFees.weight
    );

    console.log(xcmpCall);

    // Get task id
    // const turingAddress = encodeAddress(address, oakSS58Prefix.value);
    // const taskId = await oakAPI.rpc.automationTime.generateTaskId(turingAddress, providedId);

    // Sign and send scheduleXcmpTask call
    await xcmpCall.signAndSend(
      address,
      {
        signer: injector.signer,
        nonce: -1,
      },
      (result) => {
        (async () => {
          const res = await txResHandler(result);
        })();
      }
    );
  };

  return {
    compoundAll,
    isLoadingAutoCompound,
  };
}
