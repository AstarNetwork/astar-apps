<template>
  <router-link
    v-if="canRegister"
    :to="networkParam + Path.DappStaking + Path.Register"
    class="router"
  >
    <div class="register--container">
      <div class="congrats">&#127881; {{ `${$t('stakingV3.dappRegistered')}` }}</div>
      <div>{{ `${$t('stakingV3.registerNow')}` }}</div>
    </div>
  </router-link>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
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
.router {
  width: 100%;
}

.register--container {
  display: flex;
  justify-content: space-between;
  background-color: $astar-blue;
  border-radius: 6px;
  padding: 16px;
  cursor: pointer;
  color: $gray-1;
  font-size: 16px;
}

.register--container:hover {
  outline: 1px solid $astar-blue;
}

.congrats {
  color: $gray-1;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
}
</style>
