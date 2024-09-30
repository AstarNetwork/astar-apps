import { computed } from 'vue';
import { useDappStaking } from './useDappStaking';
import { PeriodType } from '../logic';
import { useBlockTime } from 'src/hooks';

export function useVotingCountdown() {
  const { protocolState, currentBlock } = useDappStaking();
  const { blockTimeInSeconds } = useBlockTime();

  const secondsLeft = computed<number>(() => {
    if (
      protocolState.value === undefined ||
      currentBlock.value === undefined ||
      blockTimeInSeconds.value === undefined ||
      protocolState.value.periodInfo.subperiod === PeriodType.BuildAndEarn
    ) {
      return 0;
    }

    return (protocolState.value.nextEraStart - currentBlock.value) * blockTimeInSeconds.value;
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
