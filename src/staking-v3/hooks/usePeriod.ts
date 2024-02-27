import { computed } from 'vue';
import { useDappStaking } from './useDappStaking';
import { PeriodType } from '../logic';
import { useI18n } from 'vue-i18n';

export function usePeriod() {
  const { protocolState, constants, currentBlock, eraLengths } = useDappStaking();
  const { t } = useI18n();

  const periodName = computed<string>(() =>
    protocolState.value?.periodInfo.subperiod === PeriodType.Voting
      ? t('stakingV3.vote')
      : t('stakingV3.buildAndEarn')
  );

  const periodDuration = computed<number | undefined>(() =>
    protocolState.value?.periodInfo.subperiod === PeriodType.Voting
      ? eraLengths.value?.standardErasPerVotingPeriod
      : eraLengths.value?.standardErasPerBuildAndEarnPeriod
  );

  const periodCurrentDay = computed<number | undefined>(() => {
    if (
      !protocolState.value ||
      !constants.value ||
      !currentBlock.value ||
      eraLengths.value.standardErasPerVotingPeriod === 0
    ) {
      return undefined;
    }

    if (protocolState.value.periodInfo.subperiod === PeriodType.BuildAndEarn) {
      return (
        (periodDuration.value ?? 0) -
        (protocolState.value.periodInfo.nextSubperiodStartEra - protocolState.value.era) +
        1
      );
    } else {
      // Voting is a bit special case. The subperiod takes standardErasPerVotingPeriod time,
      // but at the end of the period era number will increase by 1.
      return (
        eraLengths.value.standardErasPerVotingPeriod -
        Math.floor(
          (protocolState.value.nextEraStart - currentBlock.value) /
            eraLengths.value.standardEraLength
        )
      );
    }
  });

  return { periodName, periodDuration, periodCurrentDay };
}
