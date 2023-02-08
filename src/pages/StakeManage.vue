<template>
  <stake-manage class="stake-top" />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { defineComponent } from 'vue';
import StakeManage from 'src/components/dapp-staking/stake-manage/StakeManage.vue';
import { meta } from 'src/config/metadata';
export default defineComponent({
  components: { StakeManage },
  setup() {
    useMeta({
      title: meta.title.dappsStaking.stake,
      meta: {
        description: {
          name: 'description',
          content: meta.description.dappsStaking,
        },
      },
    });
  },
});
</script>
<style lang="scss" scoped>
.stake-top {
  @media (min-width: $lg) {
    margin-top: 50px;
  }
}
</style>
