<template>
  <div>
    <h2>{{ tag }}</h2>
    <div class="list-container">
      <dapp-card v-for="dapp of dapps" :key="dapp.contract.address" :dapp="dapp" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs, watchEffect } from 'vue';
import { useStore } from 'src/store';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import DappCard from 'src/v2/components/dapp-staking/DappCard.vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {
    DappCard,
  },
  props: {
    tag: {
      type: String,
      default: undefined,
    },
  },
  setup(props) {
    const store = useStore();
    const { t } = useI18n();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const dapps = computed<DappCombinedInfo[]>(() =>
      store.getters['dapps/getRegisteredDapps'](props.tag)
    );

    watchEffect(() => {
      if (isH160.value) {
        store.dispatch('general/showAlertMsg', {
          msg: t('dappStaking.error.onlySupportsSubstrate'),
          alertType: 'error',
        });
      }
    });

    return {
      ...toRefs(props),
      dapps,
    };
  },
});
</script>

<style scoped>
.list-container {
  display: flex;
  flex-wrap: wrap;
}
</style>
