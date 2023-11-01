<template>
  <img v-if="iconUrl" :src="iconUrl" class="text--account-name__icon" />
  <jazzicon v-else class="text--account-name__icon" :address="nativeAddress" :diameter="32" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';

export default defineComponent({
  components: { [Jazzicon.name]: Jazzicon },
  props: {
    nativeAddress: {
      type: String,
      required: false,
      default: undefined,
    },
    iconUrl: {
      type: String,
      required: false,
      default: undefined,
    },
  },

  setup() {},
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
