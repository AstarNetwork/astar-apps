<template>
  <div class="tw-space-y-6">
    <div class="tw-font-bold tw-text-left">Please read carefully</div>
    <!-- TODO: need to add static texts here -->
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
