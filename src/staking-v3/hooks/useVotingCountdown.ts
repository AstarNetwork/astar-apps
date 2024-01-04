import { computed } from 'vue';
import { useDappStaking } from './useDappStaking';
import { PeriodType } from '../logic';

export function useVotingCountdown() {
  const { protocolState, currentBlock, eraLengths } = useDappStaking();
  const blockTimeInSeconds = 12;

  const secondsLeft = computed<number>(() => {
    if (
      protocolState.value === undefined ||
      currentBlock.value === undefined ||
      protocolState.value.periodInfo.subperiod === PeriodType.BuildAndEarn
    ) {
      return 0;
    }

    const blocksUntilNextEra = protocolState.value.nextEraStart - currentBlock.value;
    const blocksUntilNextSubperiod =
      blocksUntilNextEra +
      (protocolState.value.periodInfo.nextSubperiodStartEra - protocolState.value.era - 1) *
        eraLengths.value.standardEraLength;
    const secondsUntilNextSubperiod = blocksUntilNextSubperiod * blockTimeInSeconds;

    return secondsUntilNextSubperiod;
  });

  const timeLeftFormatted = computed<string>(() => {
    const seconds = secondsLeft.value;
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${days}d:${hours}h:${minutes}m`;
  });

  return { secondsLeft, timeLeftFormatted };
}
