<template>
  <div class="wrapper--select-account">
    <div class="row--input">
      <div class="box__row--wallet" @click="openOption = !openOption">
        <div class="wrapper--row--selected-account">
          <img v-if="selectedSignatory" width="24" :src="getWalletImg(selectedSignatory)" />
          <div class="txt--wallet-name">
            {{ selectedSignatory ? selectedSignatory.name : 'Select Multisig Signatory' }}
          </div>
        </div>
      </div>
      <div v-if="openOption" v-click-away="closeOption" class="box--wallet-option">
        <ul class="container--wallet">
          <li
            v-for="(account, index) in substrateAccounts"
            :key="index"
            role="option"
            class="list"
            @click="handleSelectSignatory(account)"
          >
            <div class="box__row">
              <img width="24" :src="getWalletImg(account)" alt="wallet-icon" />
              <span>
                {{ account.name }}
              </span>
              <span class="text--title">{{ getShortenAddress(account.address) }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { getShortenAddress } from '@astar-network/astar-sdk-core';
import { supportWalletObj } from 'src/config/wallets';
import { useStore } from 'src/store';
import { SubstrateAccount } from 'src/store/general/state';
import { computed, defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  props: {
    selectedSignatory: {
      type: Object as PropType<SubstrateAccount>,
      required: false,
      default: null,
    },
    setSelectedSignatory: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const openOption = ref<boolean>(false);
    const selWalletIcon = ref<string>('');
    const selWalletIdx = ref<string>('');

    const closeOption = () => {
      openOption.value = false;
    };

    const substrateAccounts = computed<SubstrateAccount[]>(
      () => store.getters['general/substrateAccounts']
    );

    const handleSelectSignatory = (account: SubstrateAccount): void => {
      props.setSelectedSignatory(account);
      closeOption();
    };

    const getWalletImg = (account: SubstrateAccount) => {
      // @ts-ignore
      const src = supportWalletObj[account.source];
      return src ? src.img : supportWalletObj['polkadot-js'].img;
    };

    return {
      openOption,
      closeOption,
      selWalletIdx,
      selWalletIcon,
      substrateAccounts,
      supportWalletObj,
      getShortenAddress,
      handleSelectSignatory,
      getWalletImg,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.box__row--wallet {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 6px;
  height: rem(56);
  font-weight: 700;
  font-size: 16px;
  line-height: 18px;
  color: $gray-5;
  margin: 0 auto;
  margin-top: 16px;
  padding: 16px;
  cursor: pointer;
  border: 1px solid $gray-3;
  transition: all 0.4s ease 0s;
  &:hover {
    border: 1px solid $astar-blue;
  }

  .wrapper--row--selected-account {
    display: flex;
    align-items: center;

    .txt--wallet-name {
      margin-left: 8px;
    }
  }

  .txt--change {
    color: $astar-blue-dark;
    margin-right: 8px;
  }
}

.box__row {
  display: flex;
  column-gap: 8px;
  height: 36px;
  align-items: center;
  padding: 16px;
  padding-top: 24px;
  padding-bottom: 24px;
  cursor: pointer;
  &:hover {
    transition: all 0.3s ease 0s;
    background-color: $gray-2;
  }
}

.box--wallet-option {
  position: absolute;
  width: 100%;
  left: 50%;
  transform: translate(-50%);
  z-index: 10;
  background: $gray-1;
  /* background: $container-bg-white; */
  box-shadow: 0px 3px 0px rgba(180, 180, 180, 0.5);
  border-radius: 0px 0px 10px 10px;
}

.container--wallet {
  max-height: 228px;
  border-radius: 6px;
  padding-top: 4px;
  overflow: auto;
  overflow-x: hidden;
  &:focus {
    outline: none;
  }
}

.body--dark {
  .box__row--wallet {
    border: 1px solid $navy-3;
  }
  .box--wallet-option {
    background: $gray-6;
    box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.5);
  }
  .box__row--wallet {
    color: $gray-1;
  }
  .box__row {
    &:hover {
      background-color: $gray-5;
    }
  }
}
</style>
