import { EventRecord } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { balanceFormatter } from 'src/hooks/helper/plasmUtils';

export const calculateClaimedStaker = ({
  events,
  senderAddress,
}: {
  events: EventRecord[];
  senderAddress: string;
}): { formattedAmount: string; claimedAmount: number } => {
  let totalClaimStaker = new BN(0);
  events.forEach(({ event: { data, method, section } }) => {
    if (section === 'dappsStaking' && method === 'Reward') {
      const d = data.toHuman() as string[];
      const isClaimStakerEvent = d[0] === senderAddress;
      const claimedAmount = d[3];
      if (isClaimStakerEvent) {
        const amount = claimedAmount.replace(/,/g, '');
        totalClaimStaker = totalClaimStaker.add(new BN(amount));
      }
    }
  });
  const claimedAmount = Number(ethers.utils.formatEther(totalClaimStaker.toString()).toString());
  const formattedAmount = balanceFormatter(totalClaimStaker);
  return { claimedAmount, formattedAmount };
};
