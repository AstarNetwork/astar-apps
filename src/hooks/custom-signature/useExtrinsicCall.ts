import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { useStore } from 'src/store';
import { $api } from 'boot/api';
import { u8aToHex } from '@polkadot/util';
import { AccountInfo } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { getPayload } from 'src/hooks/extrinsic/payload';
import { useMetamask } from 'src/hooks/custom-signature/useMetamask';
import { providerEndpoints } from 'src/config/chainEndpoints';

interface CallOptions {
  onResult: (_: ISubmittableResult) => void;
  onTransactionError: (_: Error) => void;
}

export function useExtrinsicCall({ onResult, onTransactionError }: CallOptions) {
  const { requestSignature } = useMetamask();
  const store = useStore();
  const { t } = useI18n();

  const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
  const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);

  const callFunc = async (method: SubmittableExtrinsic<'promise'>) => {
    const account = <AccountInfo>await $api?.query.system.account(currentEcdsaAccount.value.ss58);
    const callPayload = u8aToHex(
      getPayload(method, account.nonce, providerEndpoints[currentNetworkIdx.value].prefix || 0)
    );

    if (callPayload) {
      // Sign transaction with eth private key
      const signature = await requestSignature(callPayload, currentEcdsaAccount.value.ethereum);
      const call = $api?.tx.ethCall.call(
        method,
        currentEcdsaAccount.value.ss58,
        signature,
        account.nonce
      );
      call
        ?.send((result: ISubmittableResult) => onResult(result))
        .catch((e: Error) => onTransactionError(e));
    } else {
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.unableCalculateMsgPayload'),
        alertType: 'error',
      });
    }
  };

  return {
    callFunc,
  };
}
