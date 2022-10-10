<template>
  <div class="wrapper--project-details">
    <div class="box--details">
      <div class="row--item">
        <div class="row--item-title">
          <div class="icon">
            <astar-icon-home />
          </div>
          <span>
            {{ $t('dappStaking.dappPage.projectSite') }}
          </span>
        </div>
        <div class="row--websites">
          <a class="text--website" :href="dapp.dapp.url" target="_blank" rel="noopener noreferrer">
            {{ $t('dappStaking.dappPage.goToWebsite') }}
          </a>
        </div>
      </div>
      <div class="separator--details" />
      <div class="row--item">
        <div class="row--item-title">
          <div class="icon">
            <astar-icon-desktop />
          </div>
          <span> {{ $t('dappStaking.dappPage.virtualMachine') }}</span>
        </div>
        <div>
          <div class="tag">
            <!-- Todo: get the value from db -->
            <span class="text--tag">
              {{ $t('evm') }}
              <!-- {{ $t('wasm') }} -->
            </span>
          </div>
        </div>
      </div>
      <div class="separator--details" />
      <div class="row--item">
        <div class="row--item-title">
          <div class="column--icon-arrows">
            <div class="icon">
              <astar-icon-arrow-left />
            </div>
            <div class="icon icon--arrow-right">
              <astar-icon-arrow-right />
            </div>
          </div>
          <span>
            {{ $t('dappStaking.dappPage.contractAddress') }}
          </span>
        </div>
        <div class="row--address">
          <div class="column--address">
            <span class="tag">{{ getShortenAddress(dapp.dapp.address, 8) }}</span>
          </div>
          <div class="icons">
            <button class="box--share btn--primary" @click="copyAddress(dapp.dapp.address)">
              <div class="icon--primary">
                <astar-icon-copy />
              </div>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('copy') }}</span>
              </q-tooltip>
            </button>
            <a :href="blockscout + dapp.dapp.address" target="_blank" rel="noopener noreferrer">
              <button class="box--share btn--primary">
                <div class="icon--primary">
                  <astar-icon-external-link />
                </div>
                <q-tooltip>
                  <span class="text--tooltip">{{ $t('blockscout') }}</span>
                </q-tooltip>
              </button>
            </a>
          </div>
        </div>
      </div>
      <div class="separator--details" />
      <div class="row--item">
        <div class="row--item-title">
          <div class="icon">
            <astar-icon-verified />
          </div>
          <span>
            {{ $t('dappStaking.dappPage.license') }}
          </span>
        </div>
        <div>
          <div class="tag">
            <span class="text--tag">{{ dapp.dapp.license }}</span>
          </div>
        </div>
      </div>
      <div class="separator--details" />
      <div class="row--item">
        <div class="row--item-title">
          <div class="icon">
            <astar-icon-group />
          </div>
          <span>
            {{ $t('dappStaking.dappPage.community') }}
          </span>
        </div>
        <div class="row--social-icons">
          <button class="box--share btn--primary">
            <div class="icon--social">
              <a :href="dapp.dapp.formUrl" target="_blank" rel="noopener noreferrer">
                <astar-icon-base viewBox="0 0 512 512" icon-name="Twitter">
                  <astar-icon-twitter />
                </astar-icon-base>
              </a>
            </div>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('common.twitter') }}</span>
            </q-tooltip>
          </button>
          <button class="box--share btn--primary">
            <div class="icon--social">
              <astar-icon-base viewBox="0 0 512 512" icon-name="Discord">
                <astar-icon-discord />
              </astar-icon-base>
            </div>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('common.discord') }}</span>
            </q-tooltip>
          </button>
          <button class="box--share btn--primary">
            <div class="icon--social">
              <astar-icon-base viewBox="0 0 512 512" icon-name="Telegram">
                <astar-icon-telegram />
              </astar-icon-base>
            </div>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('common.telegram') }}</span>
            </q-tooltip>
          </button>
          <button class="box--share btn--primary">
            <div class="icon--social">
              <a :href="dapp.dapp.gitHubUrl" target="_blank" rel="noopener noreferrer">
                <astar-icon-base viewBox="0 0 512 512" icon-name="Telegram">
                  <astar-icon-github />
                </astar-icon-base>
              </a>
            </div>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('common.github') }}</span>
            </q-tooltip>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import copy from 'copy-to-clipboard';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { useNetworkInfo } from 'src/hooks';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { sanitizeData } from 'src/hooks/helper/markdown';
import { useStore } from 'src/store';
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const { currentNetworkIdx } = useNetworkInfo();
    const store = useStore();
    const { t } = useI18n();
    const blockscout = computed(
      () => `${providerEndpoints[currentNetworkIdx.value].blockscout}/address/`
    );
    const copyAddress = (address: string): void => {
      copy(address);
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.copyAddressSuccessfully'),
        alertType: 'success',
      });
    };

    return { sanitizeData, getShortenAddress, copyAddress, blockscout };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/project-details.scss';
</style>
