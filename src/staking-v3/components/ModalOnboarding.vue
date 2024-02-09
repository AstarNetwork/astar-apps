<template>
  <astar-default-modal
    v-if="show"
    :show="show"
    :is-closing="isClosingModal"
    :width="580"
    :class="'highest-z-index wrapper--modal-onboarding'"
    @close="closeModal"
  >
    <div class="modal__top">
      <div class="title--onboarding">
        {{ $t('stakingV3.onboarding.introducing') }}<br />
        <span>{{ $t('stakingV3.title') }}</span>
      </div>
    </div>
    <div class="modal__bottom">
      <div class="modal__bottom-inner">
        <swiper
          :pagination="true"
          :navigation="true"
          :modules="modules"
          class="swiper--modal-onboarding"
        >
          <swiper-slide>
            <div class="text--title">
              {{ $t('stakingV3.onboarding.innovativeWayOfStaking') }}
            </div>
            <div class="text--description">
              {{ $t('stakingV3.onboarding.receiveStakerRewards') }}
            </div>
          </swiper-slide>
          <swiper-slide>
            <div class="text--title">
              {{ $t('stakingV3.onboarding.earnBonusByVoting') }}
            </div>
            <div class="text--description">
              {{ $t('stakingV3.onboarding.receiveBonusRrewards') }}
            </div>
          </swiper-slide>
          <swiper-slide>
            <div class="text--title text--yellow">
              {{ $t('stakingV3.onboarding.remember') }}
            </div>
            <div class="text--description">
              {{ $t('stakingV3.onboarding.stakingResetsEveryPeriod') }}
            </div>
          </swiper-slide>
          <swiper-slide>
            <div class="text--title">
              <router-link :to="RoutePath.DappStaking" @click="closeModal">
                <span>{{ $t('stakingV3.onboarding.goToDappStakingAndVoteToday') }}</span>
                <astar-icon-arrow-right />
              </router-link>
            </div>
            <div class="text--links">
              <a :href="docsUrl.learnDappStaking" target="_blank" rel="noopener noreferrer">
                <span>{{ $t('stakingV3.onboarding.whatIsDappStaking') }}</span>
                <astar-icon-arrow-right />
              </a>
              <a :href="docsUrl.dappStakingForStakers" target="_blank" rel="noopener noreferrer">
                <span>{{ $t('stakingV3.onboarding.usersGuides') }}</span>
                <astar-icon-arrow-right />
              </a>
            </div>
          </swiper-slide>
        </swiper>
      </div>
      <div class="bg--modal-onboarding">
        <img :src="require('/src/staking-v3/assets/leaderboard_bg.webp')" alt="" />
      </div>
    </div>
  </astar-default-modal>
</template>

<script lang="ts">
import { wait } from '@astar-network/astar-sdk-core';
import { fadeDuration } from '@astar-network/astar-ui';
import { defineComponent, ref } from 'vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { Path as RoutePath } from 'src/router/routes';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { docsUrl } from 'src/links';

export default defineComponent({
  components: { Swiper, SwiperSlide },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    setIsOpen: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.setIsOpen(false);
      isClosingModal.value = false;
      localStorage.setItem(LOCAL_STORAGE.CLOSE_DAPP_STAKING_V3_ONBOARDING, 'true');
    };

    if (localStorage.getItem(LOCAL_STORAGE.CLOSE_DAPP_STAKING_V3_ONBOARDING)) {
      closeModal();
    }

    return {
      isClosingModal,
      modules: [Navigation, Pagination],
      RoutePath,
      docsUrl,
      closeModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/modal-onboarding.scss';
</style>

<style lang="scss">
.body--dark {
  .wrapper--modal-onboarding {
    .modal-content {
      background-color: white !important;
    }
  }
}
.swiper--modal-onboarding {
  .swiper-button-prev,
  .swiper-button-next {
    margin: 0;
    width: 40px;
    height: 40px;
    top: inherit;
    bottom: 0;
    display: block;
    text-align: center;
    background-color: $astar-blue;
    border-radius: 9999px;
    z-index: 9999;
    transition: all 0.2s ease;
    &:hover {
      background-color: lighten($astar-blue, 10%);
    }
    &::after {
      font-size: 12px;
      font-weight: 600;
      line-height: 40px;
      color: white;
    }
  }
  .swiper-button-prev {
    left: 0;
  }
  .swiper-button-next {
    right: 0;
  }
  .swiper-button-disabled {
    display: none;
  }
  .swiper-pagination {
    height: 40px;
    margin-top: 40px;
    position: relative;
    top: inherit;
    bottom: inherit;
    line-height: 40px;
    .swiper-pagination-bullet {
      background-color: $gray-2;
      &.swiper-pagination-bullet-active {
        background-color: $astar-blue;
      }
    }
  }
}
</style>
