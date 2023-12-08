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
          <astar-irregular-button
            :width="140"
            :height="25"
            class="button--website"
            @click="goLink(dapp.dapp.url)"
          >
            {{ $t('dappStaking.dappPage.goToWebsite') }}
          </astar-irregular-button>
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
        <div class="row--tags">
          <div v-for="(tag, index) in virtualMachineTags" :key="index" class="tag">
            <span class="text--tag">
              {{ tag }}
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
            <a :href="explorerUrl" target="_blank" rel="noopener noreferrer">
              <button class="box--share btn--primary">
                <div class="icon--primary">
                  <astar-icon-external-link />
                </div>
                <q-tooltip>
                  <span class="text--tooltip">
                    {{ $t(dapp.dapp.address.startsWith('0x') ? 'blockscout' : 'subscan') }}
                  </span>
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
      <div v-if="communities" class="separator--details" />
      <div v-if="communities" class="row--item">
        <div class="row--item-title">
          <div class="icon">
            <astar-icon-group />
          </div>
          <span>
            {{ $t('dappStaking.dappPage.community') }}
          </span>
        </div>
        <div class="row--social-icons">
          <div v-for="(it, index) in communities" :key="index">
            <button v-if="it.type === CommunityType.GitHub" class="box--share btn--primary">
              <div class="icon--social">
                <a :href="it.handle" target="_blank" rel="noopener noreferrer">
                  <astar-icon-base viewBox="0 0 512 512" :icon-name="CommunityType.GitHub">
                    <astar-icon-github />
                  </astar-icon-base>
                </a>
              </div>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('common.github') }}</span>
              </q-tooltip>
            </button>
            <button v-if="it.type === CommunityType.Discord" class="box--share btn--primary">
              <div class="icon--social">
                <a :href="it.handle" target="_blank" rel="noopener noreferrer">
                  <astar-icon-base viewBox="0 0 512 512" :icon-name="CommunityType.Discord">
                    <astar-icon-discord />
                  </astar-icon-base>
                </a>
              </div>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('common.discord') }}</span>
              </q-tooltip>
            </button>
            <button v-if="it.type === CommunityType.Twitter" class="box--share btn--primary">
              <div class="icon--social">
                <a :href="it.handle" target="_blank" rel="noopener noreferrer">
                  <astar-icon-base viewBox="0 0 512 512" :icon-name="CommunityType.Twitter">
                    <astar-icon-twitter />
                  </astar-icon-base>
                </a>
              </div>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('common.twitter') }}</span>
              </q-tooltip>
            </button>
            <button v-if="it.type === CommunityType.Reddit" class="box--share btn--primary">
              <div class="icon--social">
                <a :href="it.handle" target="_blank" rel="noopener noreferrer">
                  <astar-icon-base :icon-name="CommunityType.Reddit">
                    <astar-icon-reddit />
                  </astar-icon-base>
                </a>
              </div>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('common.reddit') }}</span>
              </q-tooltip>
            </button>
            <button v-if="it.type === CommunityType.Facebook" class="box--share btn--primary">
              <div class="icon--social">
                <a :href="it.handle" target="_blank" rel="noopener noreferrer">
                  <astar-icon-base viewBox="0 0 19 19" :icon-name="CommunityType.Facebook">
                    <astar-icon-facebook />
                  </astar-icon-base>
                </a>
              </div>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('common.facebook') }}</span>
              </q-tooltip>
            </button>
            <button v-if="it.type === CommunityType.YouTube" class="box--share btn--primary">
              <div class="icon--social">
                <a :href="it.handle" target="_blank" rel="noopener noreferrer">
                  <astar-icon-base viewBox="0 0 20 17" :icon-name="CommunityType.YouTube">
                    <astar-icon-youtube />
                  </astar-icon-base>
                </a>
              </div>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('common.youtube') }}</span>
              </q-tooltip>
            </button>
            <button v-if="it.type === CommunityType.Instagram" class="box--share btn--primary">
              <div class="icon--social">
                <a :href="it.handle" target="_blank" rel="noopener noreferrer">
                  <astar-icon-base viewBox="0 0 18 18" :icon-name="CommunityType.Instagram">
                    <astar-icon-instagram />
                  </astar-icon-base>
                </a>
              </div>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('common.instagram') }}</span>
              </q-tooltip>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import copy from 'copy-to-clipboard';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { useNetworkInfo } from 'src/hooks';
import { sanitizeData } from 'src/hooks/helper/markdown';
import { getShortenAddress, hasProperty } from '@astar-network/astar-sdk-core';
import { useStore } from 'src/store';
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { CommunityType } from '@astar-network/astar-sdk-core';

interface Community {
  type: string;
  handle: string;
}

export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { currentNetworkIdx } = useNetworkInfo();
    const store = useStore();
    const { t } = useI18n();

    const explorerUrl = computed<string>(() => {
      const address = props.dapp.dapp.address;
      const blockscout = `${providerEndpoints[currentNetworkIdx.value].blockscout}/address/`;
      const subscan = `${providerEndpoints[currentNetworkIdx.value].subscan}/account/`;
      const explorer = address.startsWith('0x') ? blockscout : subscan;
      return explorer + address;
    });

    const copyAddress = (address: string): void => {
      copy(address);
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.copyAddressSuccessfully'),
        alertType: 'copied',
      });
    };

    const communities = computed<Community[] | null>(() => {
      if (props.dapp.dapp && hasProperty(props.dapp.dapp, 'communities')) {
        return props.dapp.dapp.communities as Community[];
      } else {
        return null;
      }
    });

    const virtualMachineTags = computed<string[]>(() => {
      if (props.dapp.dapp && hasProperty(props.dapp.dapp, 'contractType')) {
        if (props.dapp.dapp.contractType === 'wasm+evm') {
          return ['EVM', 'WASM'];
        } else {
          return [props.dapp.dapp.contractType];
        }
      } else {
        return ['EVM'];
      }
    });

    const goLink = (url: string) => {
      window.open(url, '_blank');
    };

    return {
      sanitizeData,
      getShortenAddress,
      copyAddress,
      goLink,
      explorerUrl,
      communities,
      virtualMachineTags,
      CommunityType,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/project-details.scss';
</style>
