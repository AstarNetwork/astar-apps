<template>
  <modal-wrapper
    :is-modal-open="show"
    title=""
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="wrapper--maintenance">
      <div class="main--text">{{ $t('stakingV3.dappStaking.Disabled') }}</div>
      <div class="sub-text">{{ $t('dappStaking.maintenance.visitLater') }}</div>
      <div class="home" @click="goToAssets">{{ $t('links.goToAssets') }}</div>
    </div>
  </modal-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { useDappStaking } from '../hooks';
import { Path } from 'src/router';

export default defineComponent({
  name: 'MaintenanceMode',
  components: {
    ModalWrapper,
  },
  setup() {
    const router = useRouter();
    const { protocolState } = useDappStaking();
    const show = computed<boolean>(() => {
      return protocolState.value ? protocolState.value.maintenance : false;
    });
    const isClosingModal = ref(false);
    const closeModal = () => {};
    const goToAssets = () => {
      router.push(Path.Assets);
    };

    return {
      show,
      isClosingModal,
      closeModal,
      goToAssets,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.wrapper--maintenance {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  width: 100%;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  color: $container-bg-white;
  row-gap: 24px;
  padding: 16px;
  padding-bottom: 48px;
  color: $navy-1;
}

.main--text {
  font-size: 48px;
  font-style: normal;
  font-weight: 900;
  line-height: 96.8%;
  margin: 16px 0;
}

.home {
  cursor: pointer;
  color: $astar-blue;
}

.body--dark {
  .wrapper--maintenance {
    color: $gray-1;
  }
}
</style>
