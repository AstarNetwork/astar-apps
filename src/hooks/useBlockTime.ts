/* eslint-disable prettier-vue/prettier */
import { ApiPromise } from '@polkadot/api';
import { VoidFn } from '@polkadot/api/types';
import { BN, BN_ONE, BN_THOUSAND, BN_TWO, bnToBn, extractTime } from '@polkadot/util';
import { onUnmounted, ref, Ref, watchEffect } from 'vue';

const DEFAULT_TIME = new BN(6_000);
const THRESHOLD = BN_THOUSAND.div(BN_TWO);
const AVG_BLOCK_TIME_MILLISEC = 12000;

export function useBlockTime(api: ApiPromise) {
  const blockTime = ref<number>(0);
  const unsub: Ref<VoidFn | undefined> = ref();

  watchEffect(() => {
    if (unsub.value) {
      unsub.value();
      unsub.value = undefined;
    }

    const time = (
      // Babe
      api.consts.babe?.expectedBlockTime ||
      // POW, eg. Kulupu
      api.consts.difficulty?.targetBlockTime || (
        // Check against threshold to determine value validity
        api.consts.timestamp?.minimumPeriod.gte(THRESHOLD)
          // Default minimum period config
          ? api.consts.timestamp.minimumPeriod.mul(BN_TWO)
          : DEFAULT_TIME.mul(BN_TWO)
        ));
    
    blockTime.value = time.toNumber();
  });

  onUnmounted(() => {
    const unsubFn = unsub.value;
    if (unsubFn) {
      unsubFn();
    }
  });
  return {
    blockTime,
  };
}
