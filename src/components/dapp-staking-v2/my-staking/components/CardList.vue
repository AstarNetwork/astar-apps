<template>
  <div class="wrapper--list">
    <div
      v-for="(t, index) in items"
      :key="index"
      :class="`card ${t.isStaking ? 'stake-card' : ''}`"
    >
      <div class="wrapper--card">
        <div class="wrapper--img">
          <q-img :src="t.img" class="img--dapp" fit="contain" />
        </div>
        <div class="panel--right">
          <div class="txt--title">{{ t.title }}</div>
          <div class="badge--tag">{{ t.category }}</div>
          <div class="divider"></div>
          <div class="row--metric">
            <div class="row--numStakers">
              <astar-icon-base class="icon--community" stroke="currentColor" width="20" height="18">
                <astar-icon-community />
              </astar-icon-base>
              {{ t.numStakers.toLocaleString() }}
            </div>
            <div>{{ t.amtStake.toLocaleString() }} ASTR</div>
          </div>
        </div>
      </div>
      <astar-button v-show="t.isStaking" width="274" height="24">Stake now</astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  props: {
    items: {
      type: Array as PropType<any[]>,
      required: true,
    },
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.card {
  padding: 16px;
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
      width: 48px;
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
}

.stake-card {
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0px 0px 24px 10px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
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
  }
  .stake-card {
    background: rgba(247, 247, 248, 0.03);
    box-shadow: 0px 0px 24px 5px rgba(0, 0, 0, 0.15);
  }
}
</style>