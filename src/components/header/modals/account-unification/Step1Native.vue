<template>
  <div class="wrapper--account-unification">
    <div class="instructions">
      <div>
        <div class="text--title">General</div>
        <ul>
          <li>Once accounts are unified, they will not be separated.</li>
        </ul>
      </div>
      <div>
        <div class="text--title">EVM wallet (Metamask only)</div>
        <ul>
          <li><strong>A brand-new empty account is recommended.</strong></li>
          <li>
            If the EVM account holds any staked ASTR token, those need to be unstataked first, it
            will not be merged automatically.
          </li>
          <li>
            If you have custom xcTokens or any xcTokens are not listed on Astar EVM Portal, you must
            transfer them to a different account first. We will not able to find those tokens
            therefore unable to move them to the new account.
          </li>
          <li>
            All other already listed xcTokens as well as ERC20 tokens will be automatically
            transferred to new unified account.
          </li>
        </ul>
      </div>
      <div>
        <div class="text--title">Native Account</div>
        <ul>
          <li>
            If you already have an account ID that is created on Polkadot.js app, this account
            unification information will override.
          </li>
        </ul>
      </div>
    </div>

    <div class="warning-check">
      <div>
        <input v-model="isChecked" type="checkbox" />
      </div>
      <div>I have read all and I would like to proceed to create a unified account please.</div>
    </div>
    <div>
      <astar-button class="btn" :disabled="!isChecked" @click="next()">Next</astar-button>
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
    const isChecked = ref<boolean>(false);

    return {
      isChecked,
      next,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
