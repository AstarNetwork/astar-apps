<template>
  <div class="wrapper--account-unification">
    <div class="unified-account-details">
      <!-- EVM Account -->
      <div>
        <div class="label">EVM Account</div>
        <div class="evm-account">
          <img :src="icon_img.metamask" class="icon" />
          <span>0x111122223333</span>
        </div>
      </div>

      <!-- Account Name -->
      <div>
        <div class="label">Account Name</div>
        <div><input v-model="accountName" type="text" placeholder="Unified Account Name" /></div>
      </div>

      <!-- Account Icon -->
      <div>
        <div class="label">
          Account icon (EVM NFT can only be selected after creating the account)
        </div>
        <!-- TODO: open a select NFT modal -->
        <button type="button" class="account-icon">
          <img :src="icon_img.astar_gradient" class="icon" />
        </button>
      </div>
    </div>

    <!-- Action -->
    <div>
      <astar-button class="btn" :disabled="accountName === ''" @click="next()">Next</astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  components: {},
  emits: ['next'],
  setup(props, { emit }) {
    const next = () => {
      emit('next');
    };

    const accountName = ref<string>('');

    const icon_img = {
      astar_gradient: require('/src/assets/img/astar_icon.svg'),
      metamask: require('/src/assets/img/metamask.png'),
    };

    return {
      accountName,
      icon_img,
      next,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
