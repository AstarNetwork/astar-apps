import { computed, ref, onMounted } from 'vue';
import { useNetworkInfo } from './useNetworkInfo';
import axios from 'axios';
import { endpointKey } from 'src/config/chainEndpoints';

export type GovernanceData = {
  title: string;
  index: number;
  state: string;
  url: string;
};

const proposals = ref<GovernanceData[]>([]);
const ongoingReferenda = ref<GovernanceData>();
const hasProposals = computed<boolean>(() => proposals.value.length > 0);
const baseApiUrl = (network: string): string => `https://${network}-api.subsquare.io`;
const baseUrl = (network: string): string => `https://${network}.subsquare.io`;

const fetchProposals = async (network: string): Promise<GovernanceData[]> => {
  try {
    const url = `${baseApiUrl(network)}/democracy/proposals?simple=true&page=1&page_size=2`;
    const response = await axios.get(url);

    if (response.data) {
      return response.data.items.map(
        (proposal: { title: string; proposalIndex: number; proposalState: { state: string } }) => {
          return <GovernanceData>{
            title: proposal.title,
            index: proposal.proposalIndex,
            state: proposal.proposalState.state,
            url: `${baseUrl(network)}/democracy/proposal/${proposal.proposalIndex}`,
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
    const url = `${baseApiUrl(network)}/democracy/referendums?simple=true&page=1&page_size=5`;
    const response = await axios.get(url);

    if (response.data) {
      const referendas = response.data.items.map(
        (referenda: { title: string; referendumIndex: number; state: string }) => {
          return <GovernanceData>{
            title: referenda.title,
            index: referenda.referendumIndex,
            state: referenda.state ?? 'Unknown',
            url: `${baseUrl(network)}/democracy/referenda/${referenda.referendumIndex}`,
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
  const { currentNetworkIdx, networkNameSubstrate } = useNetworkInfo();

  const networkLowercase = computed<string>(() => {
    return networkNameSubstrate.value.toLowerCase();
  });

  const isGovernanceEnabled = computed<boolean>(() => {
    return currentNetworkIdx.value === endpointKey.ASTAR;
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
    hasProposals,
  };
}
