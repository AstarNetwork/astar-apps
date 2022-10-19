<template>
  <router-link :to="networkParam + Path.DappStaking + Path.Register">
    <div v-if="canRegister" class="register--container">
      <div class="congrats">&#127881; {{ `${$t('dappStaking.dappRegistered')}` }}</div>
      <div>{{ `${$t('dappStaking.registerNow')}` }}</div>
    </div>
  </router-link>
</template>

<script lang="ts">
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, defineComponent, ref, watch } from 'vue';
import { networkParam, Path } from 'src/router/routes';

export default defineComponent({
  setup() {
    const store = useStore();

    const canRegister = ref<boolean>(false);
    const currentAddress = computed(() => store.getters['general/selectedAddress']);

    const getDapp = async (): Promise<void> => {
      const service = container.get<IDappStakingService>(Symbols.DappStakingService);
      const developerContract =
        currentAddress.value && (await service.getRegisteredContract(currentAddress.value));

      try {
        const dapp =
          developerContract &&
          (await service.getDapp(developerContract, networkParam.replace('/', '')));
      } catch (e) {
        canRegister.value = true;
        console.error(e);
      }
    };

    watch(
      [currentAddress],
      () => {
        if (currentAddress) {
          getDapp();
        }
      },
      { immediate: true }
    );

    return {
      canRegister,
      networkParam,
      Path,
    };
  },
});
</script>

<style lang="scss" scoped>
.register--container {
  display: flex;
  justify-content: space-between;
  background-color: $astar-blue;
  border-radius: 6px;
  padding: 24px;
  cursor: pointer;
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
