<template>
  <div class="wrapper--your-rewards">
    <div class="row--title">
      <span> {{ $t('stakingV3.yourRewards') }} </span>
    </div>
    <!-- Memo: Temporary UI -->
    <div class="row--claim-temporary">
      <div>
        <span class="text--lg">Unclaimed Eras: </span>
        <span class="text--lg">20</span>
      </div>
      <div>
        <span class="text--lg">Claimable Amount: </span>
        <span class="text--lg">
          {{ $t('amountToken', { amount: 100, token: nativeTokenSymbol }) }}
        </span>
      </div>
      <div>
        <astar-button class="button--claim">
          {{ $t('stakingV3.claim') }}
        </astar-button>
      </div>
    </div>
    <!-- Memo: mocked UI -->
    <div class="container--rewards">
      <div class="box--rewards">
        <div class="box__row">
          <div>
            <span class="text--title">
              {{ $t('stakingV3.period', { period: '006' }) }}
            </span>
          </div>
          <div class="row--claim-info">
            <div>
              <span class="text--vivid">
                {{ $t('stakingV3.availableToClaim') }}
              </span>
            </div>
            <div>
              <div>
                <span class="text--vivid">
                  {{ $t('stakingV3.days', { day: 10 }) }}
                </span>
              </div>
              <div>
                <span class="text--vivid-bond">
                  <token-balance :balance="'1000'" :symbol="nativeTokenSymbol" />
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="box__row">
          <div>
            <span class="text--title">
              {{ $t('stakingV3.period', { period: '005' }) }}
            </span>
          </div>
          <div class="row--claim-info">
            <div>
              <span class="text--info"> {{ $t('stakingV3.alreadyClaimed') }}</span>
            </div>
            <div>
              <div>
                <span class="text--info">
                  {{ $t('stakingV3.days', { day: 10 }) }}
                </span>
              </div>
              <div>
                <span class="text--info-bond">
                  <token-balance :balance="'1000'" :symbol="nativeTokenSymbol" />
                </span>
              </div>
            </div>
          </div>
          <div class="row--claim-info">
            <div>
              <span class="text--vivid"> {{ $t('stakingV3.availableToClaim') }}</span>
            </div>
            <div>
              <div>
                <span class="text--vivid">
                  {{ $t('stakingV3.days', { day: 10 }) }}
                </span>
              </div>
              <div>
                <span class="text--vivid-bond">
                  <token-balance :balance="'1000'" :symbol="nativeTokenSymbol" />
                </span>
              </div>
            </div>
          </div>
          <div class="row--attention">
            <span> {{ $t('stakingV3.claimNow') }}</span>
          </div>
        </div>
        <div>
          <astar-button class="button--claim">
            {{ $t('stakingV3.claim') }}
          </astar-button>
        </div>
      </div>

      <div>
        <div class="box--rewards">
          <div class="box__row">
            <div class="row--claim-info">
              <div class="box__column">
                <div>
                  <span class="text--title">
                    {{ $t('stakingV3.period', { period: '004' }) }}
                  </span>
                </div>
                <div>
                  <span class="text--info">
                    {{ $t('stakingV3.days', { day: 123 }) }}
                  </span>
                </div>
              </div>
              <div class="box__column">
                <div class="column--status-claimed">
                  <span>
                    {{ $t('stakingV3.claimed') }}
                  </span>
                </div>
                <div>
                  <span class="text--info-bond">
                    <token-balance :balance="'1000'" :symbol="nativeTokenSymbol" />
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="box__row">
            <div class="row--claim-info">
              <div class="box__column">
                <div>
                  <span class="text--title">
                    {{ $t('stakingV3.period', { period: '003' }) }}
                  </span>
                </div>
                <div>
                  <span class="text--info">
                    {{ $t('stakingV3.days', { day: 123 }) }}
                  </span>
                </div>
              </div>
              <div class="box__column">
                <div class="column--status-claimed">
                  <span>
                    {{ $t('stakingV3.claimed') }}
                  </span>
                </div>
                <div>
                  <span class="text--info-bond">
                    <token-balance :balance="'1000'" :symbol="nativeTokenSymbol" />
                  </span>
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
import TokenBalance from 'src/components/common/TokenBalance.vue';

export default defineComponent({
  components: { TokenBalance },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();

    return { nativeTokenSymbol };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/your-rewards.scss';
</style>
