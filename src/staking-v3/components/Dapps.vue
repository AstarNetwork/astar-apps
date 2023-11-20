<template>
  <div class="wrapper--dapps">
    <div v-for="(dapp, index) in registeredDapps" :key="index">
      <div v-if="dapp" class="card--dapp">
        <div class="card__top">
          <div>
            <img :src="dapp.basic.iconUrl" alt="icon" class="icon--dapp" />
          </div>
          <div>
            <span class="text--title">{{ dapp.basic.name }}</span>
          </div>
        </div>
        <div class="card__bottom">
          <div>
            <span class="text--label">2,432</span>
          </div>
          <div>
            <span class="text--label">1.078M ASTR</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useDapps } from '../hooks';

export default defineComponent({
  setup() {
    const { registeredDapps } = useDapps();

    return { registeredDapps };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapps.scss';
</style>
