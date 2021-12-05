<template>
  <div
    class="
      tw-flex tw-justify-center
      md:tw-justify-between
      tw-items-center tw-flex-wrap tw-gap-x-2
      sm:tw-gap-x-3
      md:tw-gap-x-7
      tw-gap-y-4
      md:tw-gap-y-0
    "
  >
    <div class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-gap-y-1">
      <div class="tw-font-semibold tw-text-blue-900 dark:tw-text-white">Staked only</div>
      <Toggle v-model:value="isToggleOn" :is-small="true" @toggleAction="toggleAction" />
    </div>
    <div>
      <q-input v-model="search" :dark="$q.dark.isActive" debounce="500" filled placeholder="Search">
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script lang="ts">
import { useAccount, useApi } from 'src/hooks';
import { useStore } from 'src/store';
import { GetDappsParameters } from 'src/store/dapps-store/actions';
import { defineComponent, ref, watchEffect } from 'vue';
import Toggle from '../common/Toggle.vue';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';

export default defineComponent({
  components: {
    Toggle,
  },

  setup() {
    const isToggleOn = ref<boolean>(false);
    const search = ref<string>('');
    const store = useStore();
    const { currentAccount } = useAccount();
    const { api } = useApi();

    const toggleAction = () => {
      isToggleOn.value = !isToggleOn.value;
    };

    watchEffect(() => {
      const apiRef = api && api.value;
      store.dispatch('dapps/getDapps', {
        keyword: search.value,
        isStakedOnly: isToggleOn.value,
        address: currentAccount.value,
        api: isToggleOn.value ? apiRef : null,
      } as GetDappsParameters);
    });

    return {
      toggleAction,
      isToggleOn,
      currentAccount,
      search,
      getShortenAddress,
    };
  },
});
</script>
