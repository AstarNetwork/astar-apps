<template>
  <div v-if="isSnap" class="banner">
    <div class="row--banner">
      <span class="text--deprecated">{{ $t('common.snapDeprecated') }}</span>
      <a :href="docsUrl.availableWallets" target="_blank" class="banner__link" rel="noreferrer">
        <b>{{ $t('common.availableWallet') }}</b>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { docsUrl } from 'src/links';
import { useStore } from 'src/store';
import { getSelectedAccount } from 'src/hooks/helper/wallet';
import { SupportWallet } from 'src/config/wallets';
import { useAccount } from 'src/hooks';

export default defineComponent({
  setup() {
    const store = useStore();
    const isSnap = ref<boolean>(false);
    const { currentAccount, substrateAccounts } = useAccount();

    watch(
      [substrateAccounts, currentAccount],
      () => {
        const selectedWallet = getSelectedAccount(substrateAccounts.value);
        isSnap.value = selectedWallet?.source === SupportWallet.Snap;
      },
      { immediate: false }
    );

    return { docsUrl, isSnap };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.banner {
  background: linear-gradient(270deg, #ff94cd 26.04%, #e6007a 100%);
  color: $gray-2;
  font-weight: 600;
  padding: 4px 8px 8px 8px;
  font-size: 12px;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;

  @media (min-width: $sm) {
    font-size: 14px;
    padding: 4px 16px 8px 16px;
  }
}

.row--banner {
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 4px;
  margin-right: 4px;

  @media (min-width: $sm) {
    margin-right: 8px;
  }
}

.text--deprecated {
  margin-right: 4px;
}

.banner__link {
  color: blue;
  text-decoration: underline;
}
</style>
