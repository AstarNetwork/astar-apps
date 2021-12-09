<template>
  <div class="tw-relative">
    <label
      class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
      >{{ $t('contracts.modals.instantiationConstructor') }}</label
    >

    <button type="button" class="option-button" @click="openOption = !openOption">
      <div class="tw-flex tw-items-center tw-justify-between">
        <div class="tw-flex tw-items-center">
          <div class="tw-flex">
            <div class="tw-font-semibold tw-text-blue-400">
              {{ constructors[constructorIndex].identifier }}
            </div>
            <div>{{ `(${argsStrings[constructorIndex]})` }}</div>
          </div>
        </div>
      </div>

      <span
        class="
          tw-ml-3
          tw-absolute
          tw-inset-y-0
          tw-right-0
          tw-flex
          tw-items-center
          tw-pr-2
          tw-pointer-events-none
        "
      >
        <icon-base
          class="tw-h-5 tw-w-5 tw-text-gray-400 dark:tw-text-darkGray-300"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <icon-solid-selector />
        </icon-base>
      </span>
    </button>

    <div
      v-if="openOption"
      class="
        tw-block tw-absolute tw-mt-1 tw-w-full tw-rounded-md tw-bg-white
        dark:tw-bg-darkGray-800
        tw-shadow-lg tw-z-10 tw-border tw-border-gray-200
        dark:tw-border-darkGray-600
      "
    >
      <ul class="tw-max-h-56 tw-rounded-md tw-text-base tw-overflow-auto focus:tw-outline-none">
        <div
          v-for="constructor in constructors"
          :key="constructor.index"
          class="constructor-div"
          @click="onSelectConstructor(constructor.index)"
        >
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center">
              <div class="tw-flex dark:tw-text-white tw-px-4 tw-py-2">
                <div class="tw-font-semibold tw-text-blue-400">
                  {{ constructor.identifier }}
                </div>
                <div>{{ `(${argsStrings[constructor.index]})` }}</div>
              </div>
            </div>
          </div>
        </div>
      </ul>
    </div>
    <div class="tw-mt-7 tw-ml-6">
      <div
        v-for="(argString, paramIndex) in argsStrings[constructorIndex].split(',')"
        :key="paramIndex"
      >
        <div v-if="constructors[constructorIndex].args.length" class="tw-ml-5 tw-pl-10 tw-my-3">
          <div class="tw-mb-3 tw-font-bold">{{ argString }}</div>
          <InputAmount
            v-if="isBalanceType(paramIndex)"
            v-model:amount="balance"
            v-model:selectedUnit="unit"
            :is-max-button="false"
            @input="updateParam({ balance, unit }, paramIndex)"
          />
          <input
            v-else
            class="params-input"
            type="string"
            :value="params[paramIndex] && params[paramIndex].value"
            @input="updateParam($event.target.value, paramIndex)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BN from 'bn.js';
import { getArgsString } from 'src/hooks/helper/params';
import { Param, ParamValue } from 'src/hooks/types/Params';
import { MessageType } from 'src/hooks/types/Message';
import { defineComponent, PropType, ref, watch } from 'vue';
import IconSolidSelector from 'components/icons/IconSolidSelector.vue';
import IconBase from 'components/icons/IconBase.vue';
import { useApi } from 'src/hooks';
import { getParamValues } from 'src/hooks/helper/params';
import InputAmount from 'components/common/InputAmount.vue';

export default defineComponent({
  components: {
    IconBase,
    IconSolidSelector,
    InputAmount,
  },
  props: {
    constructors: {
      required: true,
      type: Array as PropType<MessageType[]>,
    },
    params: {
      required: true,
      type: Array as PropType<(Param | never)[]>,
    },
    constructorIndex: {
      required: true,
      type: Number,
    },
  },
  emits: ['update:params', 'update:constructorIndex'],
  setup(props, { emit }) {
    const openOption = ref<boolean>(false);
    const argsStrings = props.constructors
      .map(getArgsString)
      .map((argString) => (argString ? argString : ' '));
    const onSelectConstructor = (index: number) => {
      emit('update:constructorIndex', index);
      openOption.value = false;
    };
    const { api } = useApi();

    const balance = ref(new BN(0));
    const tokens = api?.value?.registry?.chainTokens;
    const unit = ref((tokens || [])[0]);

    const isBalanceType = (paramIndex: number) => {
      return props.constructors[props.constructorIndex].args[paramIndex].type.type === 'Balance';
    };

    watch(
      () => props.constructorIndex,
      (i) => {
        const params = (
          getParamValues(api?.value?.registry, props.constructors[i].args) as any[]
        ).map((pv, paramIndex) => {
          let paramValue: ParamValue = pv as string;
          if (isBalanceType(paramIndex)) {
            paramValue = { balance: balance.value, unit: unit.value };
          }
          return {
            info: props.constructors[i].args[paramIndex].type.info,
            type: props.constructors[i].args[paramIndex].type.type,
            value: paramValue,
          };
        });
        emit('update:params', params);
      },
      { immediate: true }
    );

    const updateParam = (paramValue: ParamValue, paramIndex: number) => {
      const params = props.params;
      params[paramIndex].value = paramValue;
      emit('update:params', params);
    };

    return {
      openOption,
      argsStrings,
      onSelectConstructor,
      isBalanceType,
      balance,
      unit,
      updateParam,
    };
  },
});
</script>

<style scoped>
.option-button {
  @apply tw-relative tw-text-blue-900 dark:tw-text-darkGray-100 tw-w-full tw-bg-white dark:tw-bg-darkGray-900 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-rounded-md tw-pl-3 tw-pr-10 tw-py-3 tw-text-left;
}
.option-button:hover {
  @apply tw-bg-gray-50 dark:tw-bg-darkGray-800;
}
.option-button:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-darkGray-600;
}

.constructor-div {
  @apply tw-cursor-pointer;
}
.constructor-div:hover {
  @apply tw-bg-gray-50 dark:tw-bg-darkGray-700;
}

.params-input {
  @apply tw-p-4 tw-w-full tw-text-blue-900 dark:tw-text-darkGray-100 tw-text-2xl tw-bg-transparent tw-placeholder-gray-300 dark:tw-placeholder-darkGray-600 tw-bg-white dark:tw-bg-darkGray-900 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-rounded-md tw-pl-3 tw-text-left;
}
.params-input:hover {
  @apply tw-bg-gray-50 dark:tw-bg-darkGray-800;
}
.params-input:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-darkGray-600;
}
</style>
