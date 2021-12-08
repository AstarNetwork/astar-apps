<template>
  <Modal>
    <template #content>
      <div class="tw-flex tw-flex-row tw-flex-wrap">
        <q-carousel v-model="slide" class="tw-w-96" swipeable animated navigation arrows infinite>
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
        <div class="tw-w-96 tw-pl-4 dark:tw-text-darkGray-100">
          <div class="tw-flex tw-flex-col tw-items-center">
            <Avatar :url="dapp.iconUrl" class="tw-w-24 tw-h-24" />
            <div class="tw-my-2 tw-text-2xl tw-font-semibold">
              {{ dapp.name }}
              <a :href="dapp.gitHubUrl" target="_blank">
                <img width="20" class="tw-inline tw-ml-2" src="~assets/img/github.png" />
              </a>
            </div>
            <q-markdown
              :src="dapp.description"
              no-emoji="false"
              no-html="true"
              class="tw-w-full"
            ></q-markdown>
          </div>
        </div>
      </div>
      <!-- <div class="tw-flex tw-flex-col tw-justify-center tw-items-center dark:tw-text-darkGray-100">
        <Avatar :url="dapp.iconUrl" class="tw-w-36 tw-h-36" />
        <div class="tw-my-8 tw-text-2xl tw-font-semibold">{{ dapp.name }}</div>
        <div>{{ dapp.description }}</div>
        <div class="tw-my-8 tw-w-full tw-text-lg">
          <a :href="dapp.url" target="_blank">{{ dapp.url }}</a>
        </div>
        <p class="tw-w-full">
          {{ $t('store.modals.contractAddress', { address: dapp.address }) }}
        </p>
      </div> -->
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, toRefs, ref } from 'vue';
import Modal from 'components/common/Modal.vue';
import Avatar from 'components/common/Avatar.vue';

export default defineComponent({
  components: {
    Modal,
    Avatar,
  },
  props: {
    dapp: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const slide = ref<string>('video');

    return {
      slide,
      ...toRefs(props),
    };
  },
});
</script>
