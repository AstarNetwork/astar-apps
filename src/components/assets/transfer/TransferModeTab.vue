<template>
  <div class="row--tab">
    <div class="row--mode-tab">
      <div
        :class="[isLocalTransfer ? 'selected-tab text--selected' : 'unselected-tab']"
        class="box--tab"
        @click="setIsLocalTransfer(true)"
      >
        <span class="text--title-tab"> {{ $t('assets.transfer') }} </span>
      </div>
      <div @click="!isDisabledXcm && setIsLocalTransfer(false)">
        <div
          v-click-away="setIsMobileDisplayTooltip"
          :class="[
            !isLocalTransfer ? 'selected-tab text--selected' : 'unselected-tab',
            isDisabledXcm && 'option--disabled',
            isDisabledXcm && 'text-color--disabled',
          ]"
          class="box--tab"
          @click="setIsMobileDisplayTooltip"
        >
          <span class="text--title-tab"> {{ $t('assets.transferPage.crossChainTransfer') }} </span>
          <span class="text--xcm"> {{ $t('assets.transferPage.xcm') }} </span>
          <q-tooltip
            v-if="disabledXcmMemo"
            v-model="isDisplayTooltip"
            anchor="top middle"
            :self="`bottom ${$q.platform.is.mobile ? 'end' : 'middle'}`"
            class="box--tooltip box--tooltip-warning"
          >
            <span class="text--tooltip">{{ disabledXcmMemo }}</span>
          </q-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { useNetworkInfo, useTooltip } from 'src/hooks';
import { defineComponent, computed } from 'vue';
import { Asset } from 'src/v2/models';
import { restrictedXcmNetwork } from 'src/modules/xcm';
import { useI18n } from 'vue-i18n';
export default defineComponent({
  props: {
    isLocalTransfer: {
      type: Boolean,
      required: true,
    },
    setIsLocalTransfer: {
      type: Function,
      required: true,
    },
    isDisabledXcm: {
      type: Boolean,
      required: true,
    },
    token: {
      type: Asset,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const { isDisplayTooltip, setIsMobileDisplayTooltip } = useTooltip('icon');
    const { currentNetworkChain } = useNetworkInfo();
    const { t } = useI18n();

    const disabledXcmMemo = computed<string>(() => {
      if (!props.isDisabledXcm) return '';
      const restrictedNetworksArray = restrictedXcmNetwork[currentNetworkChain.value] || [];
      const network =
        restrictedNetworksArray.length > 0 &&
        restrictedNetworksArray.find((it) => it.chain === props.token?.originChain);
      if (!network) return '';
      const text = network.isRestrictedFromNative ? 'xcmIsDisabled' : 'xcmEvmIsDisabled';
      return t(`assets.transferPage.${text}`, { network: network.chain });
    });
    return { isDisplayTooltip, disabledXcmMemo, setIsMobileDisplayTooltip };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer-mode-tab.scss';
</style>
