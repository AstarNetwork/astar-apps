import { computed, watchEffect } from 'vue';
import { useDappStaking } from './useDappStaking';
import { PeriodType } from '../logic';
import { useI18n } from 'vue-i18n';

export function usePeriod() {
  const { protocolState, constants, currentBlock } = useDappStaking();
  const { t } = useI18n();

  const periodName = computed<string>(() =>
    protocolState.value?.periodInfo.subperiod === PeriodType.Voting
      ? t('stakingV3.vote')
      : t('stakingV3.build')
  );

  const periodDuration = computed<number | undefined>(() =>
    protocolState.value?.periodInfo.subperiod === PeriodType.Voting
      ? constants.value?.standardErasPerVotingPeriod
      : constants.value?.standardErasPerBuildAndEarnPeriod
  );

  const periodCurrentDay = computed<number | undefined>(() => {
    if (!protocolState.value || !constants.value) {
      return undefined;
    }

    if (protocolState.value.periodInfo.subperiod === PeriodType.BuildAndEarn) {
      return (
        (periodDuration.value ?? 0) -
        (protocolState.value.periodInfo.nextSubperiodStartEra - protocolState.value.era)
      );
    } else {
      // Voting is a bit special case. The subperiod takes standardErasPerVotingPeriod time,
      // but at the end of the period era number will increase by 1.
      return (
        constants.value.standardErasPerVotingPeriod -
        Math.floor(
          (protocolState.value.nextEraStart - currentBlock.value) /
            constants.value.standardEraLength
        )
      );
    }
  });

  watchEffect(() => {
    console.log('periodName', periodName.value);
    console.log('periodDuration', periodDuration.value);
    console.log('periodCurrentDay', periodCurrentDay.value);
  });

  return { periodName, periodDuration, periodCurrentDay };
}
