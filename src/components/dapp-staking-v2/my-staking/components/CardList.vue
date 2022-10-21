<template>
  <div class="wrapper--list">
    <div
      v-for="(t, index) in dapps"
      :key="t.contract.address"
      class="card"
      @mouseover="hoverIndex = index"
      @click="goDappPageLink(t.dapp?.address)"
    >
      <div class="wrapper--card">
        <div class="wrapper--img">
          <q-img :src="t.dapp?.iconUrl" class="img--dapp" fit="contain" no-spinner />
        </div>
        <div class="panel--right">
          <div class="txt--title">{{ t.dapp?.name }}</div>
          <div class="badge--tag">{{ category }}</div>
          <div class="divider"></div>
          <div class="row--metric">
            <div class="row--numStakers">
              <astar-icon-base class="icon--community" stroke="currentColor" width="20" height="18">
                <astar-icon-community />
              </astar-icon-base>
              {{ t.stakerInfo.stakersCount.toLocaleString() }}
            </div>
            <div>
              <token-balance
                :balance="t.stakerInfo.totalStakeFormatted.toString()"
                :symbol="nativeTokenSymbol"
                :decimals="0"
              />
            </div>
          </div>
        </div>
      </div>
      <astar-button
        v-if="index === hoverIndex || width < screenSize.lg"
        class="button--stake"
        width="274"
        height="24"
        @click="goStakePageLink(t.dapp?.address)"
      >
        {{ $t('dappStaking.stakeNow') }}
      </astar-button>
      <div v-else style="width: 274px; height: 24px"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { useBreakpoints, useNetworkInfo } from 'src/hooks';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { networkParam, Path } from 'src/router/routes';
import { useRouter } from 'vue-router';
import TokenBalance from 'src/components/common/TokenBalance.vue';

export default defineComponent({
  components: { TokenBalance },
  props: {
    category: {
      type: String,
      required: true,
    },
    dapps: {
      type: Array as PropType<DappCombinedInfo[]>,
      required: true,
    },
  },
  setup() {
    const router = useRouter();
    const { width, screenSize } = useBreakpoints();
    const hoverIndex = ref<number>(-1);
    const { nativeTokenSymbol } = useNetworkInfo();

    const goStakePageLink = (address: string | undefined): void => {
      const base = networkParam + Path.DappStaking + Path.Stake;
      const url = `${base}?dapp=${address?.toLowerCase()}`;
      router.push(url);
    };

    const goDappPageLink = (address: string | undefined): void => {
      const base = networkParam + Path.DappStaking + Path.Dapp;
      const url = `${base}?dapp=${address?.toLowerCase()}`;
      router.push(url);
    };

    return {
      hoverIndex,
      width,
      screenSize,
      goStakePageLink,
      goDappPageLink,
      nativeTokenSymbol,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: $lg) {
    width: 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    justify-content: left;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  @media (min-width: $xxl) {
    justify-content: start;
  }
}

.card {
  padding: 16px;
  flex-basis: 30%;
  max-width: 306px;
  cursor: pointer;
  .wrapper--card {
    display: flex;
    align-items: center;
  }
  .wrapper--img {
    background: #fff;
    box-shadow: 0px 0px 10px 2px rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    width: 80px;
    height: 80px;
    .img--dapp {
      max-width: 80px;
      max-height: 80px;
      border-radius: 16px;
    }
  }

  .button--stake {
    z-index: 10;
  }

  .panel--right {
    margin-left: 16px;
    .txt--title {
      font-style: normal;
      font-weight: 600;
      font-size: 16px;
      line-height: 18px;
      color: $gray-6;
    }

    .badge--tag {
      width: 54px;
      height: 18px;
      padding: 2px 8px;
      background: $object-light;
      border-radius: 6px;
      font-style: normal;
      font-weight: 510;
      font-size: 12px;
      line-height: 14px;
      text-align: center;
      color: $gray-4;
      margin-top: 16px;
      margin-bottom: 16px;
    }

    .divider {
      width: 170px;
      border-bottom: 1px solid $object-light;
    }

    .row--metric {
      display: flex;
      align-items: center;
      gap: 16px;
      font-style: normal;
      font-weight: 600;
      font-size: 12px;
      line-height: 15px;
      color: $gray-4;
      margin-top: 8px;
      margin-bottom: 12px;

      .row--numStakers {
        display: flex;
        align-items: center;

        .icon--community {
          margin-top: 6px;
        }
      }
    }
  }
  @mixin hover {
    background: rgba(255, 255, 255, 0.5);
    box-shadow: 0px 0px 24px 10px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
  }
  &:hover {
    @include hover;
  }
  @media (max-width: $lg) {
    @include hover;
  }
}

.body--dark {
  .card {
    .wrapper--img {
      background: transparent;
    }

    .panel--right {
      .txt--title {
        color: $gray-1;
      }
      .badge--tag {
        background: $gray-5;
        color: $gray-3;
      }
      .divider {
        border-bottom-color: $gray-5;
      }
      .row--metric {
        color: $gray-3;
      }
    }
    @mixin hover {
      background: rgba(247, 247, 248, 0.03);
      box-shadow: 0px 0px 24px 5px rgba(0, 0, 0, 0.15);
    }
    &:hover {
      @include hover;
    }
    @media (max-width: $lg) {
      @include hover;
    }
  }
}
</style>
