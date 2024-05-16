<template>
  <div>
    <choose-category v-if="!currentCategory" />
    <dapps-list v-if="currentCategory" :dapps="dapps" />
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import DappsList from './DappsList.vue';
import ChooseCategory from './ChooseCategory.vue';
import { Dapp } from './Model';
import { useDapps } from 'src/staking-v3/hooks';

export default defineComponent({
  components: { DappsList, ChooseCategory },
  setup() {
    const { registeredDapps } = useDapps();
    const currentCategory = ref<string>();

    const dapps = computed<Dapp[]>(() =>
      registeredDapps.value.map((dapp) => ({
        name: dapp.basic.name,
        address: dapp.chain.address,
        logoUrl: dapp.basic.iconUrl,
        amount: 0,
        id: dapp.chain.id,
      }))
    );

    return { dapps, currentCategory };
  },
});
</script>
