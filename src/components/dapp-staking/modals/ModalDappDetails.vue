<template>
  <Modal>
    <template #content>
      <div class="tw-flex tw-flex-row tw-flex-wrap">
        <q-carousel
          v-model="slide"
          class="tw-w-96 rounded-borders"
          swipeable
          animated
          navigation
          arrows
          infinite
        >
          <q-carousel-slide name="video">
            <q-video :src="dapp.videoUrl" :name="video" class="absolute-full" />
          </q-carousel-slide>
          <q-carousel-slide
            v-for="(url, index) in dapp.imagesUrl"
            :key="index"
            :img-src="url"
            :name="index.toString()"
          />
        </q-carousel>
        <div class="tw-w-auto dark:tw-text-darkGray-100 md:tw-pl-4">
          <div class="tw-flex tw-flex-col tw-items-center">
            <q-card class="bg-auto">
              <div class="tw-flex tw-flex-col tw-items-center">
                <Avatar :url="dapp.iconUrl" class="tw-w-24 tw-h-24 tw-mt-4" />
                <div class="tw-my-2 tw-text-2xl tw-font-semibold">
                  {{ dapp.name }}
                  <a :href="dapp.gitHubUrl" target="_blank">
                    <img width="20" class="tw-inline tw-ml-2" src="~assets/img/github.png" />
                  </a>
                </div>
              </div>
              <q-separator />
              <div class="tw-flex tw-flex-wrap tw-w-full tw-m-2">
                <NameValue label="License" class="info">
                  {{ dapp.license }}
                </NameValue>
                <NameValue label="Stakers count" class="info">
                  {{ stakeInfo?.stakersCount }}
                </NameValue>
                <NameValue label="Address" class="info">
                  {{ getShortenAddress(dapp.address) }}
                </NameValue>
                <NameValue label="Staked" class="info">
                  {{ stakeInfo?.totalStake }}
                </NameValue>
              </div>
              <q-separator />
              <div class="tw-w-full tw-m-2">
                <q-chip
                  v-for="(tag, index) in dapp.tags"
                  :key="index"
                  color="blue"
                  class="tw-text-white"
                >
                  {{ tag }}
                </q-chip>
              </div>
              <q-separator />
              <div>
                <q-scroll-area class="scroll">
                  <q-markdown :src="dapp.description" :no-html="true" class="tw-m-2"></q-markdown>
                </q-scroll-area>
              </div>
            </q-card>
          </div>
        </div>
      </div>
    </template>
    <template #buttons>
      <a :href="dapp.url" target="_blank">
        <Button>
          {{ $t('dappStaking.modals.viewProject') }}
        </Button>
      </a>
      <Button @click="showStakeModal">
        {{ $t('dappStaking.stake') }}
      </Button>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, toRefs, ref, PropType } from 'vue';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import Modal from 'components/common/Modal.vue';
import Avatar from 'components/common/Avatar.vue';
import Button from 'components/common/Button.vue';
import NameValue from 'components/common/NameValue.vue';
import { DappItem } from 'src/store/dapp-staking/state';
import { StakeInfo } from 'src/store/dapp-staking/actions';

export default defineComponent({
  components: {
    Modal,
    Avatar,
    Button,
    NameValue,
  },
  props: {
    dapp: {
      type: Object as PropType<DappItem>,
      required: true,
    },
    stakeInfo: {
      type: Object as PropType<StakeInfo>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const slide = ref<string>('video');

    const showStakeModal = (): void => {
      emit('update:is-open', false);
      emit('showStake');
    };

    return {
      slide,
      ...toRefs(props),
      getShortenAddress,
      showStakeModal,
    };
  },
});
</script>
<style scoped>
.info {
  /* flex: 1 0 45%; */
  margin-bottom: 8px;
}

.info span {
  margin-right: 8px;
}

.scroll {
  height: 350px;
}
</style>
