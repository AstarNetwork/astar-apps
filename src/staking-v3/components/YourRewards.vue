<template>
  <div class="wrapper--your-rewards">
    <div class="row--title">
      <span> Your Rewards </span>
    </div>
    <!-- Memo: Temporary UI -->
    <div class="row--claim-temporary">
      <div>
        <span class="text--lg">Unclaimed Eras:</span>
        <span class="text--lg">20</span>
      </div>
      <div>
        <span class="text--lg">Claimable Amount:</span>
        <span class="text--lg">
          {{ $t('amountToken', { amount: 100, token: nativeTokenSymbol }) }}
        </span>
      </div>
      <div>
        <astar-button class="button--claim">Claim</astar-button>
      </div>
    </div>
    <div class="container--rewards">
      <div class="box--rewards">
        <div class="box__row">
          <div>
            <span class="text--title">Period 006</span>
          </div>
          <div class="row--claim-info">
            <div>
              <span class="text--vivid">Available to claim</span>
            </div>
            <div>
              <div>
                <span class="text--vivid">10 days</span>
              </div>
              <div>
                <span class="text--vivid-bond">1,000 ASTR</span>
              </div>
            </div>
          </div>
        </div>
        <div class="box__row">
          <div>
            <span class="text--title">Period 005</span>
          </div>
          <div class="row--claim-info">
            <div>
              <span class="text--info">Already claimed</span>
            </div>
            <div>
              <div>
                <span class="text--info">10 days</span>
              </div>
              <div>
                <span class="text--info-bond">1,000 ASTR</span>
              </div>
            </div>
          </div>
          <div class="row--claim-info">
            <div>
              <span class="text--vivid">Available to claim</span>
            </div>
            <div>
              <div>
                <span class="text--vivid">10 days</span>
              </div>
              <div>
                <span class="text--vivid-bond">1,000 ASTR</span>
              </div>
            </div>
          </div>
          <div class="row--attention">
            <span>Claim now this rewards will expire at the end of current period</span>
          </div>
        </div>
        <div>
          <astar-button class="button--claim">Claim</astar-button>
        </div>
      </div>

      <div>
        <div class="box--rewards">
          <div class="box__row">
            <div class="row--claim-info">
              <div class="box__column">
                <div>
                  <span class="text--title">Period 004</span>
                </div>
                <div>
                  <span class="text--info">123 days</span>
                </div>
              </div>
              <div class="box__column">
                <div class="column--status-claimed">
                  <span>Claimed</span>
                </div>
                <div>
                  <span class="text--info-bond">1,000 ASTR</span>
                </div>
              </div>
            </div>
          </div>
          <div class="box__row">
            <div class="row--claim-info">
              <div class="box__column">
                <div>
                  <span class="text--title">Period 003</span>
                </div>
                <div>
                  <span class="text--info">123 days</span>
                </div>
              </div>
              <div class="box__column">
                <div class="column--status-claimed">
                  <span>Claimed</span>
                </div>
                <div>
                  <span class="text--info-bond">1,000 ASTR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useNetworkInfo } from 'src/hooks';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  // Todo: redirect to discover page if the connected account is not the owner
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();

    return { nativeTokenSymbol };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/your-rewards.scss';
</style>
