<template>
  <astar-simple-modal
    :show="isModalTransfer"
    title="Transfer"
    :is-closing="isClosingModal"
    @close="closeModal"
  >
    <div class="wrapper--modal">
      <div class="rows">
        <div class="box--input">
          <div class="box__space-between">
            <span> {{ $t('from') }}</span>
            <div />
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
        <div class="box--input box--hover--active">
          <div class="box__space-between">
            <span> {{ $t('to') }}</span>
            <div>
              <span class="text--to--balance">
                {{ $t('assets.modals.balance', { amount: $n(toAddressBalance), token: symbol }) }}
              </span>
            </div>
          </div>
          <modal-select-account
            v-model:selAddress="toAddress"
            :to-address="toAddress"
            :is-erc20-transfer="isErc20Transfer"
          />
        </div>

        <div class="box--input box--hover--active">
          <div class="box__space-between">
            <div />
            <div class="box__available">
              <span class="text--available">
                {{
                  $t('assets.modals.balance', { amount: $n(fromAddressBalance), token: symbol })
                }}</span
              >
              <button v-if="symbol !== nativeTokenSymbol" class="btn--max" @click="toMaxAmount">
                {{ $t('assets.modals.max') }}
              </button>
            </div>
          </div>
          <div class="box__row">
            <div class="box__row">
              <img width="24" alt="token-logo" :src="tokenImg" />
              <span class="text--title">{{ symbol }}</span>
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

        <SpeedConfiguration
          :gas-cost="isH160 ? evmGasCost : nativeTipsPrice"
          :selected-gas="isH160 ? selectedGas : selectedTips"
          :set-selected-gas="isH160 ? setSelectedGas : setSelectedTips"
        />

        <div v-if="isChoseWrongEvmNetwork" class="rows__row--wrong-evm">
          <span class="text--error">{{ $t('assets.wrongNetwork') }}</span>
          <span class="text--connect-rpc" @click="connectEvmNetwork">
            {{ $t('assets.connectNetwork', { network: currentNetworkName }) }}
          </span>
        </div>
        <div v-else-if="errMsg && toAddress" class="rows__row--error">
          <span class="text--error">{{ errMsg }}</span>
        </div>
      </div>
      <div
        v-if="isRequiredCheck"
        class="box--warning"
        :class="isChecked && 'box--warning--checked'"
      >
        <div class="input--checkbox" :class="isChecked && 'input--checkbox--checked'">
          <input id="do-not-send-to-cex" v-model="isChecked" type="checkbox" />
          <label for="do-not-send-to-cex">
            <span :class="isChecked ? 'color--white' : 'color--warning'">{{
              $t('assets.modals.notSendToExchanges')
            }}</span>
          </label>
        </div>
      </div>
      <div class="wrapper__row--button">
        <button class="btn btn--confirm" :disabled="isDisabledTransfer" @click="transfer">
          {{ $t('confirm') }}
        </button>
      </div>
    </div>
  </astar-simple-modal>
</template>
<script lang="ts">
import { $api, $web3 } from 'src/boot/api';
import { getProviderIndex, providerEndpoints } from 'src/config/chainEndpoints';
import { getTokenBal } from 'src/config/web3';
import { useAccount, useChainMetadata, useEvmWallet, useTransfer, useWalletIcon } from 'src/hooks';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { isValidAddressPolkadotAddress } from 'src/hooks/helper/plasmUtils';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { getTokenImage } from 'src/modules/token';
import { computed, defineComponent, ref, watchEffect } from 'vue';
import Web3 from 'web3';
import ModalSelectAccount from './ModalSelectAccount.vue';
import { registeredErc20Tokens } from 'src/modules/token';
import { fadeDuration } from '@astar-network/astar-ui';
import SpeedConfiguration from 'src/components/common/SpeedConfiguration.vue';
import { wait } from 'src/hooks/helper/common';
import { sampleEvmWalletAddress, getEvmGasCost } from 'src/modules/gas-api';
import { ethers } from 'ethers';
import ABI from 'src/c-bridge/abi/ERC20.json';
import { AbiItem } from 'web3-utils';

export default defineComponent({
  components: { ModalSelectAccount, SpeedConfiguration },
  props: {
    isModalTransfer: {
      type: Boolean,
      required: false,
      default: false,
    },
    handleModalTransfer: {
      type: Function,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    accountData: {
      type: Object,
      required: false,
      default: null,
    },
    token: {
      type: Object || String,
      required: false,
      default: null,
    },
    handleUpdateTokenBalances: {
      type: Function,
      required: false,
      default: null,
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
    const isClosingModal = ref<boolean>(false);
    const { iconWallet } = useWalletIcon();
    const { isConnectedNetwork, currentNetworkName, connectEvmNetwork } = useEvmWallet();
    const store = useStore();
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const isEthWallet = computed(() => store.getters['general/isEthWallet']);
    const { currentAccount, currentAccountName } = useAccount();
    const nativeTokenSymbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : '';
    });

    // Memo: check the selected token is either hard-coded token or cBridge token
    const registeredToken = computed(() =>
      registeredErc20Tokens.find((it) => it.symbol === props.symbol)
    );

    const tokenImg = computed(() => {
      if (registeredToken.value) {
        return registeredToken.value.image;
      } else {
        return getTokenImage({
          isNativeToken: props.symbol === nativeTokenSymbol.value,
          symbol: props.symbol,
          iconUrl: props.token && props.token.icon,
        });
      }
    });

    const isRequiredCheck = computed(() => {
      if (
        isNativeToken.value &&
        isEthWallet.value &&
        isValidAddressPolkadotAddress(toAddress.value)
      ) {
        return true;
      } else {
        return false;
      }
    });

    const evmNetworkIdx = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      const networkIdx = getProviderIndex(chain);
      return Number(providerEndpoints[networkIdx].evmChainId);
    });

    const isChoseWrongEvmNetwork = computed(() => isH160.value && !isConnectedNetwork.value);

    const isDisabledTransfer = computed(() => {
      const isLessAmount = 0 >= Number(transferAmt.value);
      const isMissedCheck = isRequiredCheck.value && !isChecked.value;
      return errMsg.value !== '' || isLessAmount || isMissedCheck || isChoseWrongEvmNetwork.value;
    });

    const inputHandler = (event: any): void => {
      transferAmt.value = event.target.value;
      errMsg.value = '';
    };

    const resetStates = (): void => {
      transferAmt.value = '';
      toAddress.value = '';
      errMsg.value = '';
      toAddressBalance.value = 0;
      fromAddressBalance.value = 0;
      isErc20Transfer.value = false;
    };

    const setIsErc20Transfer = (): void => {
      isErc20Transfer.value = isH160.value && !isNativeToken.value;
    };

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      resetStates();
      await wait(fadeDuration);
      props.handleModalTransfer({ isOpen: false, currency: '' });
      isClosingModal.value = false;
    };

    const toMaxAmount = async (): Promise<void> => {
      if (isH160.value && !isNativeToken.value) {
        const balance = await getTokenBal({
          srcChainId: evmNetworkIdx.value,
          address: currentAccount.value,
          tokenAddress: props.token.address,
          tokenSymbol: props.token.symbol,
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
      selectedTips,
      nativeTipsPrice,
      setSelectedTips,
    } = useTransfer(defaultUnitToken, decimal, closeModal);

    const transfer = async (): Promise<void> => {
      const isErc20TransferRef = isErc20Transfer.value;
      const transferAmtRef = transferAmt.value;
      const fromAddress = currentAccount.value;
      const toAddressRef = toAddress.value;
      if (!transferAmtRef || !fromAddress || !toAddressRef) return;

      if (Number(transferAmtRef) === 0) {
        store.dispatch('general/showAlertMsg', {
          msg: 'The amount of token to be transmitted must not be zero',
          alertType: 'error',
        });
        return;
      }

      if (isErc20TransferRef) {
        const { address, decimal } = props.token;
        await callErc20Transfer({
          transferAmt: transferAmtRef,
          fromAddress,
          toAddress: toAddressRef,
          contractAddress: address,
          decimals: decimal,
        });
        props.handleUpdateTokenBalances && props.handleUpdateTokenBalances();
      } else {
        await callTransfer(Number(transferAmtRef), fromAddress, toAddressRef);
      }
    };

    const setEvmGasCost = async () => {
      try {
        const isErc20Ref = isErc20Transfer.value;
        const transferAmtRef = transferAmt.value || '1';
        const value = isErc20Ref ? '0x0' : transferAmtRef;
        const destination = ethers.utils.isAddress(toAddress.value)
          ? toAddress.value
          : sampleEvmWalletAddress;

        const destAddress = isErc20Ref ? (props.token.address as string) : destination;

        const contract = isErc20Ref
          ? new $web3.value!.eth.Contract(ABI as AbiItem[], props.token.address)
          : undefined;

        const encodedData = isErc20Ref
          ? contract!.methods
              .transfer(destination, ethers.utils.parseUnits(transferAmtRef, props.token.decimal))
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
        if (isH160.value) {
          const balance = await getTokenBal({
            srcChainId,
            address,
            tokenAddress: props.token.address,
            tokenSymbol: props.token.symbol,
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
        if (isH160.value && props.token) {
          fromAddressBalance.value = Number(props.token.userBalance);
        }
      }
    };

    const setErrorMsg = (): void => {
      const web3Ref = $web3.value;
      const transferAmtRef = Number(transferAmt.value);
      const selectedNetworkRef = selectedNetwork.value;
      const isErc20TransferRef = isErc20Transfer.value;
      const fromAccountBalance = isErc20TransferRef
        ? Number(props.token ? props.token.userBalance : 0)
        : fromAddressBalance.value;
      try {
        if (transferAmtRef > fromAccountBalance) {
          errMsg.value = 'Insufficient balance';
        } else if (isErc20TransferRef && evmNetworkIdx.value !== selectedNetworkRef) {
          errMsg.value = 'Selected invalid network in your wallet';
        } else if (isErc20TransferRef && !web3Ref?.utils.isAddress(toAddress.value)) {
          errMsg.value = 'Inputted invalid destination address';
        } else if (
          isNativeToken.value &&
          !isValidAddressPolkadotAddress(toAddress.value) &&
          !web3Ref?.utils.isAddress(toAddress.value)
        ) {
          errMsg.value = 'Inputted invalid destination address';
        } else {
          errMsg.value = '';
        }
      } catch (error: any) {
        errMsg.value = error.message;
      }
    };

    const setIsNativeToken = (): void => {
      isNativeToken.value = props.symbol === nativeTokenSymbol.value;
    };

    const setSelectedNetwork = async (): Promise<void> => {
      const provider = getEvmProvider();
      if (!isH160.value || !provider) return;
      const web3 = new Web3(provider as any);
      const chainId = await web3.eth.getChainId();
      selectedNetwork.value = chainId;
      provider &&
        provider.on('chainChanged', (chainId: string) => {
          selectedNetwork.value = Number(chainId);
        });
    };

    watchEffect(() => {
      setIsNativeToken();
      setIsErc20Transfer();
    });

    watchEffect(() => {
      setErrorMsg();
    });

    watchEffect(async () => {
      await setSelectedNetwork();
    });

    watchEffect(async () => {
      await setToAddressBalance();
    });

    watchEffect(async () => {
      await setFromAddressBalance();
    });

    watchEffect(async () => {
      if (isH160.value && props.isModalTransfer) {
        await setEvmGasCost();
      }
    });

    return {
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
      closeModal,
      isChecked,
      isRequiredCheck,
      tokenImg,
      isDisabledTransfer,
      isChoseWrongEvmNetwork,
      currentNetworkName,
      connectEvmNetwork,
      isClosingModal,
      selectedGas,
      setSelectedGas,
      evmGasCost,
      selectedTips,
      nativeTipsPrice,
      setSelectedTips,
      isH160,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-transfer.scss';
</style>
