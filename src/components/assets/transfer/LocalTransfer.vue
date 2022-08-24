<template>
  <div class="wrapper--local-transfer">
    <div class="rows">
      <div class="box--input-field">
        <div class="box__space-between">
          <span> {{ $t('from') }}</span>
          <div>
            <span class="text--to--balance">
              {{
                $t('assets.modals.balance', {
                  amount: $n(truncate(fromAddressBalance)),
                  token: token.metadata.symbol,
                })
              }}
            </span>
          </div>
        </div>
        <div class="box__row">
          <img v-if="iconWallet" width="24" :src="iconWallet" alt="wallet-icon" />
          <div class="column--wallet-address">
            <div class="column--wallet-name">
              <span class="text--title">{{ currentAccountName }}</span>
            </div>
            <span class="text--title">{{ getShortenAddress(currentAccount) }}</span>
          </div>
        </div>
      </div>
      <div class="box--input-field box--hover--active">
        <div class="box__space-between">
          <span> {{ $t('to') }}</span>
          <div>
            <span class="text--to--balance">
              {{
                $t('assets.modals.balance', {
                  amount: $n(truncate(toAddressBalance)),
                  token: token.metadata.symbol,
                })
              }}
            </span>
          </div>
        </div>
        <InputSelectAccount
          v-model:selAddress="toAddress"
          :to-address="toAddress"
          :is-erc20-transfer="isErc20Transfer"
        />
      </div>

      <div class="box--input-field box--hover--active">
        <div class="box__space-between">
          <div />
          <div class="box__available">
            <span class="text--to--balance">
              {{
                $t('assets.modals.balance', {
                  amount: $n(truncate(fromAddressBalance)),
                  token: token.metadata.symbol,
                })
              }}</span
            >
            <button
              v-if="token.metadata.symbol !== nativeTokenSymbol"
              class="btn--max"
              @click="toMaxAmount"
            >
              {{ $t('assets.modals.max') }}
            </button>
          </div>
        </div>
        <div class="box__row">
          <div class="box__row cursor-pointer" @click="setRightUi('select-token')">
            <div class="token-logo token-native-adjustment">
              <jazzicon
                v-if="token && tokenImg.includes('custom-token')"
                :address="token.mappedERC20Addr"
                :diameter="24"
              />
              <img v-else width="24" alt="token-logo" :src="tokenImg" />
            </div>
            <span class="text--title">{{ token.metadata.symbol }}</span>
            <div class="icon--expand cursor-pointer">
              <astar-icon-expand size="20" />
            </div>
          </div>
          <div class="box__column--input-amount">
            <input
              :value="transferAmt"
              inputmode="decimal"
              type="number"
              min="0"
              pattern="^[0-9]*(\.)?[0-9]*$"
              placeholder="0.0"
              class="input--amount input--no-spin"
              @input="inputHandler"
            />
          </div>
        </div>
      </div>

      <div class="separator" />

      <SpeedConfigurationV2
        v-if="isEnableSpeedConfiguration"
        :gas-cost="isH160 ? evmGasCost : nativeTipPrice"
        :selected-gas="isH160 ? selectedGas : selectedTip"
        :set-selected-gas="isH160 ? setSelectedGas : setSelectedTip"
      />

      <div v-if="isChoseWrongEvmNetwork" class="rows__row--wrong-evm">
        <span class="text--error">{{ $t('assets.wrongNetwork') }}</span>
        <span class="text--connect-rpc" @click="connectEvmNetwork">
          {{ $t('assets.connectNetwork', { network: currentNetworkName }) }}
        </span>
      </div>
    </div>
    <div v-if="isRequiredCheck" class="box--warning" :class="isChecked && 'box--warning--checked'">
      <div class="input--checkbox" :class="isChecked && 'input--checkbox--checked'">
        <input id="do-not-send-to-cex" v-model="isChecked" type="checkbox" />
        <label for="do-not-send-to-cex">
          <span :class="isChecked ? 'color--gray1' : 'color--not-checked'">{{
            $t('assets.modals.notSendToExchanges')
          }}</span>
        </label>
      </div>
    </div>
    <div v-if="errMsg && currentAccount" class="row--box-error">
      <span class="color--white"> {{ $t(errMsg) }}</span>
    </div>
    <div class="wrapper__row--button">
      <button
        class="btn btn--confirm btn-size-adjust"
        :disabled="isDisabledTransfer"
        @click="transfer"
      >
        {{ $t('confirm') }}
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { ethers } from 'ethers';
import { $api, $web3 } from 'src/boot/api';
import ABI from 'src/c-bridge/abi/ERC20.json';
import InputSelectAccount from 'src/components/assets/transfer/InputSelectAccount.vue';
import SpeedConfigurationV2 from 'src/components/common/SpeedConfigurationV2.vue';
import { SupportWallet } from 'src/config/wallets';
import { getTokenBal, isValidEvmAddress } from 'src/config/web3';
import {
  useAccount,
  useChainMetadata,
  useEvmWallet,
  useNetworkInfo,
  useTransfer,
  useTransferRouter,
  useWalletIcon,
} from 'src/hooks';
import { useEthProvider } from 'src/hooks/custom-signature/useEthProvider';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { truncate } from 'src/hooks/helper/common';
import { isValidAddressPolkadotAddress } from 'src/hooks/helper/plasmUtils';
import { EthereumProvider } from 'src/hooks/types/CustomSignature';
import { getEvmGasCost, sampleEvmWalletAddress } from 'src/modules/gas-api';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch, WatchCallback, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import Jazzicon from 'vue3-jazzicon/src/components';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

export default defineComponent({
  components: {
    InputSelectAccount,
    SpeedConfigurationV2,
    [Jazzicon.name]: Jazzicon,
  },
  props: {
    accountData: {
      type: Object,
      required: false,
      default: null,
    },
    handleFinalizedCallback: {
      type: Function,
      required: false,
      default: null,
    },
    setRightUi: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const transferAmt = ref<string | null>(null);
    const toAddressBalance = ref<number>(0);
    const fromAddressBalance = ref<number>(0);
    const isNativeToken = ref<boolean>(false);
    const isErc20Transfer = ref<boolean>(false);
    const toAddress = ref<string>('');
    const errMsg = ref<string>('');
    const selectedNetwork = ref<number>(0);
    const isChecked = ref<boolean>(false);
    const { iconWallet } = useWalletIcon();
    const { isConnectedNetwork, currentNetworkName, connectEvmNetwork } = useEvmWallet();
    const store = useStore();
    const { t } = useI18n();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const { ethProvider } = useEthProvider();
    const { evmNetworkIdx, nativeTokenSymbol } = useNetworkInfo();
    const { token } = useTransferRouter();
    const isEthWallet = computed<boolean>(() => store.getters['general/isEthWallet']);
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);

    const isEnableSpeedConfiguration = computed<boolean>(() => {
      const currentWallet = store.getters['general/currentWallet'];
      return (
        currentWallet !== SupportWallet.TalismanEvm && currentWallet !== SupportWallet.SubWalletEvm
      );
    });
    const { currentAccount, currentAccountName } = useAccount();

    const tokenImg = computed<string>(() => {
      if (!token.value || !token.value.tokenImage) {
        return 'custom-token';
      } else {
        return token.value.tokenImage;
      }
    });

    const isRequiredCheck = computed<boolean>(() => {
      if (
        isNativeToken.value &&
        isEthWallet.value &&
        isValidAddressPolkadotAddress(toAddress.value)
      ) {
        return true;
      } else if (!isNativeToken.value && isH160.value) {
        return true;
      } else {
        return false;
      }
    });

    const isChoseWrongEvmNetwork = computed<boolean>(
      () => isH160.value && !isConnectedNetwork.value
    );

    const isDisabledTransfer = computed<boolean>(() => {
      const isLessAmount = 0 >= Number(transferAmt.value);
      const isMissedCheck = isRequiredCheck.value && !isChecked.value;
      return errMsg.value !== '' || isLessAmount || isMissedCheck || isChoseWrongEvmNetwork.value;
    });

    const inputHandler = (event: any): void => {
      transferAmt.value = event.target.value;
      errMsg.value = '';
    };

    const setIsErc20Transfer = (): void => {
      isErc20Transfer.value = isH160.value && !isNativeToken.value;
    };

    const finalizedCallback = (): void => {
      props.handleFinalizedCallback();
    };

    const toMaxAmount = async (): Promise<void> => {
      if (isH160.value && !isNativeToken.value && token.value) {
        const balance = await getTokenBal({
          srcChainId: evmNetworkIdx.value,
          address: currentAccount.value,
          tokenAddress: token.value.mappedERC20Addr,
          tokenSymbol: token.value.metadata.symbol,
        });
        transferAmt.value = balance;
      }
    };

    const { defaultUnitToken, decimal } = useChainMetadata();
    const {
      callTransfer,
      callErc20Transfer,
      evmGasPrice,
      selectedGas,
      setSelectedGas,
      evmGasCost,
      selectedTip,
      nativeTipPrice,
      setSelectedTip,
    } = useTransfer(defaultUnitToken, decimal, finalizedCallback);

    const transfer = async (): Promise<void> => {
      const isErc20TransferRef = isErc20Transfer.value;
      const transferAmtRef = transferAmt.value;
      const fromAddress = currentAccount.value;
      const toAddressRef = toAddress.value;
      if (!transferAmtRef || !fromAddress || !toAddressRef) return;

      if (Number(transferAmtRef) === 0) {
        store.dispatch('general/showAlertMsg', {
          msg: t('toast.amountMustNotBeZero'),
          alertType: 'error',
        });
        return;
      }

      if (isErc20TransferRef && token.value) {
        await callErc20Transfer({
          transferAmt: transferAmtRef,
          fromAddress,
          toAddress: toAddressRef,
          contractAddress: token.value.mappedERC20Addr,
          decimals: token.value.metadata.decimals,
        });
      } else {
        await callTransfer(Number(transferAmtRef), fromAddress, toAddressRef);
      }
    };

    const setEvmGasCost = async () => {
      if (!token.value) return;
      try {
        const isErc20Ref = isErc20Transfer.value;
        const transferAmtRef = transferAmt.value || '0';
        const value = isErc20Ref ? '0x0' : transferAmtRef;
        const destination = ethers.utils.isAddress(toAddress.value)
          ? toAddress.value
          : sampleEvmWalletAddress;

        const destAddress = isErc20Ref ? (token.value.mappedERC20Addr as string) : destination;

        const contract = isErc20Ref
          ? new $web3.value!.eth.Contract(ABI as AbiItem[], token.value.mappedERC20Addr)
          : undefined;

        const encodedData = isErc20Ref
          ? contract!.methods
              .transfer(
                destination,
                ethers.utils.parseUnits(transferAmtRef, token.value.metadata.decimals)
              )
              .encodeABI()
          : undefined;

        evmGasCost.value = await getEvmGasCost({
          isNativeToken: !isErc20Ref,
          evmGasPrice: evmGasPrice.value,
          fromAddress: currentAccount.value,
          toAddress: destAddress,
          web3: $web3.value!,
          value,
          encodedData,
        });
      } catch (error) {
        console.error(error);
      }
    };

    const getNativeTokenBalance = async (address: string): Promise<number> => {
      const web3Ref = $web3.value;
      const apiRef = $api;
      if (!apiRef || !address || !web3Ref) return 0;
      if (isValidAddressPolkadotAddress(address)) {
        const { data } = await apiRef.query.system.account(address);
        return Number(web3Ref.utils.fromWei(data.free.toString()));
      }
      if (web3Ref.utils.isAddress(address)) {
        const balance = await web3Ref.eth.getBalance(address);
        return Number(web3Ref.utils.fromWei(balance));
      }
      return 0;
    };

    const setToAddressBalance = async (): Promise<void> => {
      const address = toAddress.value;
      const srcChainId = evmNetworkIdx.value;
      if (!address || !srcChainId) return;
      if (isNativeToken.value) {
        toAddressBalance.value = await getNativeTokenBalance(address);
      }
      if (!isNativeToken.value) {
        if (isH160.value && token.value) {
          const balance = await getTokenBal({
            srcChainId,
            address,
            tokenAddress: token.value.mappedERC20Addr,
            tokenSymbol: token.value.metadata.symbol,
          });
          toAddressBalance.value = Number(balance);
        }
      }
    };

    const setFromAddressBalance = async (): Promise<void> => {
      const web3Ref = $web3.value;
      const address = currentAccount.value;
      if (!address || !web3Ref) return;

      if (isNativeToken.value) {
        if (isH160.value) {
          fromAddressBalance.value = await getNativeTokenBalance(address);
        } else {
          const balance = props.accountData
            ? web3Ref.utils.fromWei(props.accountData.getUsableTransactionBalance().toString())
            : 0;
          fromAddressBalance.value = Number(balance);
        }
      }

      if (!isNativeToken.value) {
        if (isH160.value && token.value) {
          const balance = await getTokenBal({
            srcChainId: evmNetworkIdx.value,
            address: currentAccount.value,
            tokenAddress: token.value.mappedERC20Addr,
            tokenSymbol: token.value.metadata.symbol,
          });
          fromAddressBalance.value = Number(balance);
        }
      }
    };

    const setErrorMsg = (): void => {
      if (isLoading.value) return;
      const web3Ref = $web3.value;
      const transferAmtRef = Number(transferAmt.value);
      const selectedNetworkRef = selectedNetwork.value;
      const isErc20TransferRef = isErc20Transfer.value;
      const isValidDestAddress =
        isValidAddressPolkadotAddress(toAddress.value) || isValidEvmAddress(toAddress.value);

      try {
        if (transferAmtRef > fromAddressBalance.value) {
          errMsg.value = 'warning.insufficientBalance';
        } else if (isErc20TransferRef && evmNetworkIdx.value !== selectedNetworkRef) {
          errMsg.value = 'warning.selectedInvalidNetworkInWallet';
        } else if (
          isErc20TransferRef &&
          !web3Ref?.utils.isAddress(toAddress.value) &&
          toAddress.value
        ) {
          errMsg.value = 'warning.inputtedInvalidDestAddress';
        } else if (toAddress.value && !isValidDestAddress) {
          errMsg.value = 'warning.inputtedInvalidDestAddress';
        } else {
          errMsg.value = '';
        }
      } catch (error: any) {
        errMsg.value = error.message;
      }
    };

    const setIsNativeToken = (): void => {
      isNativeToken.value = token.value
        ? token.value.metadata.symbol === nativeTokenSymbol.value
        : false;
    };

    const setSelectedNetwork: WatchCallback<[any, EthereumProvider | undefined]> = async (
      [h160, provider],
      _,
      registerCleanup
    ) => {
      if (!h160 || !provider) return;
      const web3 = new Web3(provider as any);
      const chainId = await web3.eth.getChainId();
      if (selectedNetwork.value !== chainId) selectedNetwork.value = chainId;
      const handleChainChanged = (chainId: string) => {
        if (selectedNetwork.value !== Number(chainId)) selectedNetwork.value = Number(chainId);
      };
      provider.on('chainChanged', handleChainChanged);
      registerCleanup(() => {
        provider.removeListener('chainChanged', handleChainChanged);
      });
    };

    watchEffect(() => {
      setIsNativeToken();
      setIsErc20Transfer();
    });

    watch([isH160, ethProvider], setSelectedNetwork, { immediate: true });

    watchEffect(setErrorMsg);
    watchEffect(setToAddressBalance);
    watchEffect(setFromAddressBalance);

    watchEffect(async () => {
      if (isH160.value) {
        await setEvmGasCost();
      }
    });

    watchEffect(() => {
      // console.log('Local transfer');
      // console.log('token.value', token.value);
      // console.log('tokenImg', tokenImg.value);
    });

    return {
      token,
      iconWallet,
      currentAccount,
      currentAccountName,
      nativeTokenSymbol,
      getShortenAddress,
      inputHandler,
      toAddress,
      transfer,
      toAddressBalance,
      fromAddressBalance,
      toMaxAmount,
      transferAmt,
      errMsg,
      isErc20Transfer,
      isNativeToken,
      isChecked,
      isRequiredCheck,
      tokenImg,
      isDisabledTransfer,
      isChoseWrongEvmNetwork,
      currentNetworkName,
      connectEvmNetwork,
      selectedGas,
      setSelectedGas,
      evmGasCost,
      selectedTip,
      nativeTipPrice,
      setSelectedTip,
      isH160,
      truncate,
      isEnableSpeedConfiguration,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/local-transfer.scss';
</style>
