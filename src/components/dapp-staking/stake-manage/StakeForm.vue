<template>
  <div class="wrapper--stake">
    <div class="rows">
      <div>
        <span> Stake on Astar Farm </span>
      </div>
      <div class="box--input-field">
        <div class="box__space-between">
          <span> Where would you like to bring you funds from?</span>
        </div>
        <div class="box__row">
          <div class="token-logo">
            <img width="24" alt="token-logo" :src="nativeTokenImg" />
          </div>
          <div>
            <span class="text--title">Transferable Balance</span>
          </div>
        </div>
      </div>

      <div class="box--input-field box--hover--active">
        <div class="box__space-between">
          <div />
          <div class="box__available">
            <span class="text--to--balance">
              {{
                $t('assets.modals.balance', {
                  amount: $n(truncate(0)),
                  token: nativeTokenSymbol,
                })
              }}</span
            >
            <button v-if="!isTransferNativeToken" class="btn--max" @click="toMaxAmount">
              {{ $t('assets.modals.max') }}
            </button>
          </div>
        </div>
        <div class="box__row">
          <div class="box__row cursor-pointer" @click="setRightUi('select-token')">
            <div class="token-logo">
              <img width="24" alt="token-logo" :src="nativeTokenImg" />
            </div>
            <span class="text--title">{{ nativeTokenSymbol }}</span>
            <div class="icon--expand">
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
      <!-- Todo: update logic -->
      <SpeedConfigurationV2
        :gas-cost="nativeTipPrice"
        :selected-gas="selectedTip"
        :set-selected-gas="setSelectedTip"
      />

      <div
        v-if="errMsg && currentAccount"
        class="row--box-error"
        :class="isRequiredCheck && 'box--margin-adjuster'"
      >
        <span class="color--white"> {{ $t(errMsg) }}</span>
      </div>
      <div class="wrapper__row--button" :class="!errMsg && 'btn-margin-adjuster'">
        <button
          class="btn btn--confirm btn-size-adjust"
          :disabled="isDisabledTransfer"
          @click="transfer"
        >
          {{ $t('confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import SpeedConfigurationV2 from 'src/components/common/SpeedConfigurationV2.vue';
import { useAccount, useGasPrice, useNetworkInfo, useWalletIcon } from 'src/hooks';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { truncate } from 'src/hooks/helper/common';
import { getTokenImage } from 'src/modules/token';
import { useStore } from 'src/store';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  components: {
    SpeedConfigurationV2,
  },

  setup() {
    const { iconWallet } = useWalletIcon();
    const { currentAccount, currentAccountName } = useAccount();
    const { nativeTokenSymbol } = useNetworkInfo();
    const nativeTokenImg = computed<string>(() =>
      getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
    );
    const { selectedTip, nativeTipPrice, setSelectedTip } = useGasPrice();

    const store = useStore();

    return {
      iconWallet,
      currentAccount,
      currentAccountName,
      nativeTokenSymbol,
      selectedTip,
      nativeTipPrice,
      setSelectedTip,
      nativeTokenImg,
      getShortenAddress,
      truncate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/stake-manage/styles/stake-form.scss';
</style>
