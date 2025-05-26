import { computed } from 'vue';
import { container } from 'src/v2/common';
import {
  CombinedDappInfo,
  DappInfo,
  DappRegistrationParameters,
  DappState,
  FileInfo,
  IDappStakingRepository,
  IDappStakingService,
  TokenApiProviderRepository,
} from '../logic';
import { Symbols } from 'src/v2/symbols';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { BusyMessage, ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { useStore } from 'src/store';
import axios from 'axios';
import { TOKEN_API_URL, toSS58Address } from '@astar-network/astar-sdk-core';
import { NewDappItem } from 'src/staking-v3';
import { useI18n } from 'vue-i18n';

export function useDapps() {
  const store = useStore();
  const { currentNetworkName } = useNetworkInfo();
  const { t } = useI18n();
  const tokenApiProviderRepository = container.get<TokenApiProviderRepository>(
    Symbols.TokenApiProviderRepository
  );
  const { isH160Formatted } = useAccount();

  const registeredDapps = computed<CombinedDappInfo[]>(
    () => store.getters['stakingV3/getRegisteredDapps']
  );
  const allDapps = computed<CombinedDappInfo[]>(() => store.getters['stakingV3/getDapps']);
  const newDapps = computed<DappInfo[]>(() => store.getters['stakingV3/getNewDapps']);

  const fetchDappsToStore = async (): Promise<void> => {
    // Don't fetch if we already have dApps.
    if (registeredDapps.value.length > 0) {
      return;
    }

    console.log('Fetching dapps');
    const service = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    const aggregator = container.get<IEventAggregator>(Symbols.EventAggregator);

    try {
      aggregator.publish(new BusyMessage(true));
      const dApps = await service.getDapps(currentNetworkName.value.toLowerCase());
      store.commit('stakingV3/addDapps', dApps.fullInfo);
      store.commit('stakingV3/addNewDapps', dApps.chainInfo);
      // Memo: this can a heavy operations since we are querying all dapps stakes for a chain.
      await fetchStakeAmountsToStore();

      const numberOfStakersAndLockers =
        await tokenApiProviderRepository.getNumberOfStakersAndLockers(
          currentNetworkName.value.toLowerCase()
        );
      store.commit('stakingV3/setNumberOfStakersAndLockers', numberOfStakersAndLockers);
    } finally {
      aggregator.publish(new BusyMessage(false));
    }
  };

  const fetchDappToStore = async (dappAddress: string): Promise<void> => {
    const repository = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const aggregator = container.get<IEventAggregator>(Symbols.EventAggregator);

    try {
      aggregator.publish(new BusyMessage(true));
      const dapp = await repository.getDapp(currentNetworkName.value.toLowerCase(), dappAddress);
      store.commit('stakingV3/updateDappExtended', dapp);
    } finally {
      aggregator.publish(new BusyMessage(false));
    }
  };

  const fetchStakeAmountsToStore = async (dappIds: number[] = []): Promise<void> => {
    console.log('Fetching stake amounts');
    const service = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    const stakeAmounts = await service.getContractStakes(
      dappIds.length > 0 ? dappIds : registeredDapps.value.map((d) => d.chain.id)
    );

    // Update state
    registeredDapps.value.forEach((dapp) => {
      const stake = stakeAmounts.get(dapp.chain.id);
      const chain = { ...dapp.chain };
      if (stake) {
        chain.stakeVoting = stake.voting;
        chain.stakeBuildAndEarn = stake.buildAndEarn;
        chain.totalStake = stake.totalStake;
        store.commit('stakingV3/updateDappChain', chain);
      } else {
        chain.stakeVoting = chain.stakeBuildAndEarn = chain.totalStake = undefined;
      }

      store.commit('stakingV3/updateDappChain', chain);
    });
  };

  const getDapp = (dappAddress: string): CombinedDappInfo | undefined =>
    allDapps.value.find((d) => d.chain.address.toLowerCase() === dappAddress?.toLowerCase());

  const getDappByOwner = (ownerAddress: string): DappInfo | undefined => {
    const owner = isH160Formatted.value ? toSS58Address(ownerAddress) : ownerAddress;
    const dapps = [...allDapps.value.map((x) => x.chain), ...newDapps.value];
    return dapps.find((d) => d.owner === owner && d.state === DappState.Registered);
  };

  const getFileInfo = (fileName: string, dataUrl: string): FileInfo => {
    const urlParts = dataUrl.split(/[:;,]+/);

    return {
      name: fileName,
      base64content: urlParts[3],
      contentType: urlParts[1],
    };
  };

  const getImagesInfo = (dapp: NewDappItem): FileInfo[] => {
    return dapp.images
      .slice(1) // Ignore first image since it is just an add image placeholder.
      .map((image, index) => getFileInfo(image.name, dapp.imagesContent[index + 1]));
  };

  const registerDapp = async (parameters: DappRegistrationParameters): Promise<boolean> => {
    const eventAggregator = container.get<IEventAggregator>(Symbols.EventAggregator);

    try {
      const payload = {
        name: parameters.dapp.name,
        iconFile: getFileInfo(parameters.dapp.iconFileName, parameters.dapp.iconFile),
        address: parameters.dapp.address,
        url: parameters.dapp.url,
        images: getImagesInfo(parameters.dapp),
        developers: parameters.dapp.developers,
        description: parameters.dapp.description,
        shortDescription: parameters.dapp.shortDescription,
        communities: parameters.dapp.communities,
        contractType: parameters.dapp.contractType,
        mainCategory: parameters.dapp.mainCategory,
        license: parameters.dapp.license,
        tags: parameters.dapp.tags,
        senderAddress: parameters.senderAddress,
        signature: parameters.signature,
      };

      eventAggregator.publish(new BusyMessage(true));
      const url = `${TOKEN_API_URL}/v1/${parameters.network.toLocaleLowerCase()}/dapps-staking/register`;
      await axios.post(url, payload);

      eventAggregator.publish(
        new ExtrinsicStatusMessage({
          success: true,
          message: t('stakingV3.registration.success', { name: parameters.dapp.name }),
        })
      );

      return true;
    } catch (e) {
      let errorMessage: string;
      if (axios.isAxiosError(e)) {
        errorMessage = e.response?.data;
      } else if (e instanceof Error) {
        errorMessage = (e as Error).message;
      } else {
        errorMessage = String(e);
      }

      console.error(errorMessage);
      eventAggregator.publish(
        new ExtrinsicStatusMessage({
          success: false,
          message: errorMessage,
        })
      );
      alert(t('stakingV3.registration.error', { error: errorMessage }));
      return false;
    } finally {
      eventAggregator.publish(new BusyMessage(false));
    }
  };

  return {
    registeredDapps,
    allDapps,
    fetchDappsToStore,
    fetchDappToStore,
    fetchStakeAmountsToStore,
    getDapp,
    getDappByOwner,
    registerDapp,
  };
}
