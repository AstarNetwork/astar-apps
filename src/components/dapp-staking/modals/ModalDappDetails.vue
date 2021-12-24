<template>
  <Modal @click="closeModal">
    <template #content>
      <div>
        <div class="tw-flex tw-flex-row tw-flex-wrap">
          <q-card v-if="dapp.videoUrl" class="tw-w-96 md:tw-mr-4">
            <q-carousel
              v-model:fullscreen="isFullScreen"
              v-model="slide"
              class="ounded-borders tw-h-96"
              swipeable
              animated
              navigation
              arrows
              infinite
            >
              <q-carousel-slide v-model:fullscreen="isFullScreen" name="video">
                <q-video :src="dapp.videoUrl" name="video" class="absolute-full" />
              </q-carousel-slide>
              <q-carousel-slide
                v-for="(url, index) in dapp.imagesUrl"
                :key="index"
                :img-src="url"
                :name="index.toString()"
              />
              <template #control>
                <q-carousel-control position="bottom-right" :offset="[18, 18]">
                  <q-btn
                    push
                    round
                    dense
                    color="white"
                    text-color="primary"
                    :icon="isFullScreen ? 'fullscreen_exit' : 'fullscreen'"
                    @click="isFullScreen = !isFullScreen"
                  />
                </q-carousel-control>
              </template>
            </q-carousel>
          </q-card>
          <div class="tw-w-auto dark:tw-text-darkGray-100">
            <div class="tw-flex tw-flex-col tw-items-center">
              <q-card class="bg-auto tw-h-96">
                <div class="tw-flex tw-flex-col tw-items-center tw-py-4">
                  <Avatar :url="dapp.iconUrl" class="tw-w-24 tw-h-24 tw-mt-4" />
                  <div class="tw-my-2 tw-text-2xl tw-font-semibold">
                    {{ dapp.name }}
                    <a v-if="dapp.gitHubUrl" :href="dapp.gitHubUrl" target="_blank">
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
                <q-separator v-if="dapp.tags" />
                <div v-if="dapp.tags" class="tw-w-full tw-m-2">
                  <q-chip
                    v-for="(tag, index) in dapp.tags"
                    :key="index"
                    color="blue"
                    class="tw-text-white"
                  >
                    {{ tag }}
                  </q-chip>
                </div>
              </q-card>
            </div>
          </div>
        </div>
        <q-card class="tw-mt-4">
          <q-scroll-area class="scroll">
            <q-markdown :src="dapp.description" :no-html="true" class="tw-m-2"></q-markdown>
          </q-scroll-area>
        </q-card>
      </div>
      <div class="tw-mt-6 tw-flex tw-justify-center">
        <Button type="button" :primary="false" @click="closeModal">{{ $t('close') }}</Button>
        <a :href="dapp.url" target="_blank">
          <Button>
            {{ $t('dappStaking.modals.viewProject') }}
          </Button>
        </a>
        <Button @click="showStakeModal">
          {{ $t('dappStaking.stake') }}
        </Button>
      </div>
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
  emits: ['update:is-open', 'showStake'],
  setup(props, { emit }) {
    const slide = ref<string>('video');
    const isFullScreen = ref<boolean>(false);

    const showStakeModal = (): void => {
      emit('update:is-open', false);
      emit('showStake');
    };

    const closeModal = () => {
      emit('update:is-open', false);
    };

    return {
      slide,
      isFullScreen,
      ...toRefs(props),
      getShortenAddress,
      showStakeModal,
      closeModal,
    };
  },
});
</script>
<style scoped>
.info {
  margin-bottom: 8px;
}

.info span {
  margin-right: 8px;
}

.scroll {
  height: 350px;
}
</style>
