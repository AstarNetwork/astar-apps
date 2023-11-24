<template>
  <div class="wrapper--dapps">
    <div v-for="(dapp, index) in registeredDapps" :key="index">
      <div v-if="dapp" class="card--dapp" @click="goDappPageLink(dapp.basic.address)">
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
            <span class="text--label">T{{ getDappTier(dapp.chain.id) ?? '-' }}</span>
          </div>
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
import { Path, networkParam } from 'src/router/routes';
import { defineComponent } from 'vue';
import { useDappStaking, useDapps } from '../hooks';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const { registeredDapps } = useDapps();
    const { getDappTier } = useDappStaking();
    const router = useRouter();

    const goDappPageLink = (address: string): void => {
      const base = networkParam + Path.DappStaking + Path.Dapp;
      const url = `${base}?dapp=${address?.toLowerCase()}`;
      router.push(url);
    };

    return { registeredDapps, getDappTier, goDappPageLink };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapps.scss';
</style>
