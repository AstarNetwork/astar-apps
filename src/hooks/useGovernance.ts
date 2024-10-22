import { computed, ref, onMounted } from 'vue';
import { useNetworkInfo } from './useNetworkInfo';
import axios from 'axios';

export type GovernanceData = {
  title: string;
  index: number;
  state: string;
  url: string;
};

const proposals = ref<GovernanceData[]>([]);
const ongoingReferenda = ref<GovernanceData>();

const fetchProposals = async (network: string): Promise<GovernanceData[]> => {
  try {
    const url = `https://${network}.subsquare.io/api/democracy/proposals?simple=true&page=1&page_size=2`;
    const response = await axios.get(url);

    if (response.data) {
      return response.data.items.map(
        (proposal: { title: string; proposalIndex: number; proposalState: { state: string } }) => {
          return <GovernanceData>{
            title: proposal.title,
            index: proposal.proposalIndex,
            state: proposal.proposalState.state,
            url: `https://${network}.subsquare.io/democracy/proposal/${proposal.proposalIndex}`,
          };
        }
      );
    }
  } catch (error) {
    console.error('Error fetching proposals:', error);
  }

  return [];
};

const fetchOngoingReferenda = async (network: string): Promise<GovernanceData | undefined> => {
  try {
    const url = `https://${network}.subsquare.io/api/democracy/referendums?simple=true&page=1&page_size=5`;
    const response = await axios.get(url);

    if (response.data) {
      const referendas = response.data.items.map(
        (referenda: {
          title: string;
          referendumIndex: number;
          referendumState: { state: string };
        }) => {
          return <GovernanceData>{
            title: referenda.title,
            index: referenda.referendumIndex,
            state: referenda.referendumState.state,
            url: `https://${network}.subsquare.io/democracy/referenda/${referenda.referendumIndex}`,
          };
        }
      );

      return referendas.find((referenda: GovernanceData) => referenda.state === 'Started');
    }
  } catch (error) {
    console.error('Error fetching proposals:', error);
  }

  return undefined;
};

export function useGovernance() {
  const { networkNameSubstrate } = useNetworkInfo();

  const networkLowercase = computed<string>(() => {
    return networkNameSubstrate.value.toLowerCase();
  });

  const isGovernanceEnabled = computed<boolean>(() => {
    return networkLowercase.value === 'shibuya';
  });

  const governanceUrl = computed<string>(() => {
    return `https://${networkLowercase.value}.subsquare.io`;
  });

  onMounted(async () => {
    if (isGovernanceEnabled.value) {
      if (proposals.value.length === 0) {
        proposals.value = await fetchProposals(networkLowercase.value);
      }

      if (!ongoingReferenda.value) {
        ongoingReferenda.value = await fetchOngoingReferenda(networkLowercase.value);
      }
    }
  });

  return {
    isGovernanceEnabled,
    proposals,
    ongoingReferenda,
    governanceUrl,
  };
}
