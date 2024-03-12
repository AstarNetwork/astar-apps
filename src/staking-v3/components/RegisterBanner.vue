<template>
  <router-link
    v-if="canRegister"
    :to="networkParam + Path.DappStaking + Path.Register"
    class="wrapper--register-banner"
    :style="{ backgroundImage: `url(${require('src/staking-v3/assets/register_bg.webp')})` }"
  >
    <div class="congrats">
      <div class="text--congrats">&#127881; {{ `${$t('stakingV3.congrats')}` }}</div>
      <div>{{ `${$t('stakingV3.dappRegistered')}` }}</div>
    </div>
    <div class="btn--register-now">{{ `${$t('stakingV3.registerNow')}` }}</div>
  </router-link>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { networkParam, Path } from 'src/router/routes';
import { useRegisterDapp } from '../hooks';

export default defineComponent({
  setup() {
    const { dappAddressToRegister } = useRegisterDapp();
    const canRegister = computed<boolean>(() => dappAddressToRegister.value !== undefined);

    return {
      canRegister,
      networkParam,
      Path,
    };
  },
});
</script>

<style lang="scss" scoped>
.wrapper--register-banner {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  background-color: white;
  margin: 0 -16px -32px -16px;
  border: solid 1px $gray-2;
  background-position: right center;
  background-size: 250px;
  background-repeat: no-repeat;
  padding: 20px;
  font-weight: 600;
  gap: 12px;
  transition: all 0.2s ease;
  @media (min-width: $sm) {
    background-size: 300px;
    margin: 0;
    border-radius: 16px;
    flex-direction: row;
    padding: 24px 40px;
  }
  @media (min-width: $md) {
    background-size: 400px;
  }
  @media (min-width: $xxl) {
    background-size: 500px;
  }
  &:hover {
    border-color: $astar-blue;
  }
}

.text--congrats {
  font-size: 16px;
  margin-bottom: 4px;
}

.btn--register-now {
  background-color: $astar-blue;
  width: 160px;
  text-align: center;
  border-radius: 9999px;
  color: white;
  padding: 6px;
  white-space: nowrap;
  flex-shrink: none;
}

.body--dark {
  .wrapper--register-banner {
    background-color: $navy-1;
    border-color: $navy-3;
    box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.8);
    &:hover {
      border-color: $astar-blue;
    }
  }
}
</style>
