import { ASTAR_SS58_FORMAT, PayloadWithWeight } from '@astar-network/astar-sdk-core';
import { sortAddresses } from '@polkadot/util-crypto';
import { $api } from 'boot/api';
import { LocalStorage } from 'quasar';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { IWalletService, ParamSignAndSend, WalletType } from 'src/v2/services';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import copy from 'copy-to-clipboard';
import { useI18n } from 'vue-i18n';

export const useMultisig = () => {
  const store = useStore();
  const route = useRoute();
  const { t } = useI18n();
  const multisigAddress = computed<string>(() => route.query.multisig as string);
  const sendMultisigTransaction = async ({
    senderAddress,
    extrinsic,
  }: ParamSignAndSend): Promise<void> => {
    try {
      const storedMultisigObj = LocalStorage.getItem(LOCAL_STORAGE.MULTISIG);
      if (storedMultisigObj) {
        const { threshold, accounts, multisigAccount } = JSON.parse(storedMultisigObj as string);

        const isValid =
          multisigAccount === multisigAddress.value &&
          accounts.some((it: string) => it === senderAddress);

        if (!isValid) {
          store.dispatch('general/showAlertMsg', {
            msg: t('warning.configureMultisigAccount'),
            alertType: 'error',
          });
        }

        const otherSignatories = accounts.filter((it: string) => it !== senderAddress);
        const otherSignatoriesFormatted = sortAddresses(otherSignatories, ASTAR_SS58_FORMAT);

        const info = await extrinsic.paymentInfo(senderAddress);
        const weight = new PayloadWithWeight(extrinsic, info.weight);
        const multisigCall = $api!.tx.multisig.asMulti(
          threshold,
          otherSignatoriesFormatted,
          null,
          extrinsic,
          weight.asWeightV2()
        );

        const encodedMultisigData = extrinsic.method.toHex();
        console.info('multisig call data: ', encodedMultisigData);

        const walletContainer = container.get<IWalletService>(WalletType.Polkadot);
        await walletContainer.signAndSend({
          extrinsic: multisigCall,
          senderAddress: senderAddress,
          successMessage: encodedMultisigData,
        });
        copy(encodedMultisigData);
        store.dispatch('general/showAlertMsg', {
          msg: t('toast.copyMultisigCall', {
            hash: encodedMultisigData,
          }),
          alertType: 'success',
        });
      } else {
        store.dispatch('general/showAlertMsg', {
          msg: t('warning.configureMultisigAccount'),
          alertType: 'error',
        });
      }
    } catch (error: any) {
      console.error(error);
      store.dispatch('general/showAlertMsg', {
        msg: error.message,
        alertType: 'error',
      });
    }
  };
  return { sendMultisigTransaction };
};
