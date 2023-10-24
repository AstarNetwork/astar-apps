<template>
  <div class="container--account">
    <div class="row--account">
      <div class="account-name">
        {{ accountName }}
      </div>
    </div>
    <div class="row--balance-icons row--balance">
      <div>
        <span v-if="showBalance" class="text--balance">
          {{ $n(getBalance(nativeAddress)) }}
          {{ nativeTokenSymbol }}
        </span>
        <span v-else class="text--balance-hide"> ----- {{ nativeTokenSymbol }} </span>
      </div>
    </div>
    <div class="container--addresses">
      <div class="container--address">
        <img :src="walletIcons.substrate" alt="Wallet icon" />
        <account
          :account-address="nativeAddress"
          :explorer-url="explorerUrl"
          :native-token-symbol="nativeTokenSymbol"
          :show-balance-value="false"
          :show-balance="false"
          :get-balance="getBalance"
        />
      </div>
      <div class="container--address container--address--eth">
        <img :src="walletIcons.evm" alt="Wallet icon" />
        <account
          :account-address="evmAddress"
          :explorer-url="blockScout"
          :native-token-symbol="nativeTokenSymbol"
          :show-balance-value="false"
          :show-balance="false"
          :get-balance="getBalance"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { getShortenAddress } from '@astar-network/astar-sdk-core';
import Account from './Account.vue';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { useNetworkInfo } from 'src/hooks';

export default defineComponent({
  components: {
    Account,
  },
  props: {
    accountName: {
      type: String,
      required: true,
    },
    nativeAddress: {
      type: String,
      required: true,
    },
    evmAddress: {
      type: String,
      required: true,
    },
    showBalance: {
      type: Boolean,
      required: true,
    },
    nativeTokenSymbol: {
      type: String,
      required: true,
    },
    explorerUrl: {
      type: String,
      required: true,
    },
    getBalance: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const { currentNetworkIdx } = useNetworkInfo();
    const walletIcons = {
      substrate: require('/src/assets/img/logo-polkadot-js.png'),
      evm: require('/src/assets/img/ethereum.png'),
    };

    const blockScout = computed<string>(
      () => `${providerEndpoints[currentNetworkIdx.value].blockscout}/address/`
    );

    return { getShortenAddress, blockScout, walletIcons };
  },
});
</script>
<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account.scss';
@import 'src/css/quasar.variables.scss';

.container--addresses {
  width: 100%;
  padding: 12px 16px;
  background-color: $gray-1;
  border-radius: 6px;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  color: $gray-3;
}

.container--account {
  width: 100%;
}

.container--address {
  display: flex;
  align-items: center;

  img {
    width: 16px;
    height: 16px;
    margin-right: 12px;
  }
}

.container--address--eth {
  margin-top: 12px;
}

.row--balance {
  margin-top: 6px;
  margin-bottom: 16px;
}
</style>
