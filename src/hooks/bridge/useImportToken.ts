import { isValidEvmAddress } from '@astar-network/astar-sdk-core';
import ABI from 'src/config/abi/ERC20.json';
import { buildWeb3Instance, getTokenBal } from 'src/config/web3';
import { useAccount } from 'src/hooks';
import {
  EthBridgeChainId,
  EthBridgeContract,
  EthBridgeNetworkName,
  ZK_EVM_BRIDGE_ABI,
  ZkNetworkId,
  ZkToken,
} from 'src/modules/zk-evm-bridge';
import { Ref, computed, ref, watch, watchEffect } from 'vue';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

export const useImportToken = ({
  fromChainName,
  toChainName,
  importTokenAddress,
}: {
  fromChainName: string;
  toChainName: string;
  importTokenAddress: Ref<string>;
}) => {
  const fromChainId = EthBridgeChainId[fromChainName as EthBridgeNetworkName];
  const toChainId = EthBridgeChainId[toChainName as EthBridgeNetworkName];
  const web3Provider = computed<Web3>(() => buildWeb3Instance(fromChainId) as Web3);
  const toWeb3Provider = computed<Web3>(() => buildWeb3Instance(toChainId) as Web3);
  const isLoadingToken = ref<boolean>(false);
  const zkToken = ref<ZkToken>();
  const toChainTokenAddress = ref<string>('');

  const { currentAccount } = useAccount();

  const setZkToken = async (): Promise<void> => {
    const fromChainWeb3 = web3Provider.value;
    const toChainWeb3 = web3Provider.value;
    const tokenAddress = importTokenAddress.value;
    try {
      isLoadingToken.value = true;
      if (!tokenAddress || !isValidEvmAddress(tokenAddress) || !fromChainWeb3 || !toChainWeb3)
        return;

      const contract = new fromChainWeb3.eth.Contract(ABI as AbiItem[], tokenAddress);
      const [decimal, name, symbol, userBalance] = await Promise.all([
        contract.methods.decimals().call(),
        contract.methods.name().call(),
        contract.methods.symbol().call(),
        getTokenBal({
          address: currentAccount.value,
          tokenAddress,
          srcChainId: fromChainId,
        }),
      ]);

      const toChainContractAddress = EthBridgeContract[toChainName as EthBridgeNetworkName];
      const toChainContract = new toChainWeb3.eth.Contract(
        ZK_EVM_BRIDGE_ABI as AbiItem[],
        toChainContractAddress
      );

      const networkId =
        fromChainName === EthBridgeNetworkName.Ethereum ||
        fromChainName === EthBridgeNetworkName.Sepolia
          ? ZkNetworkId.L1
          : ZkNetworkId.L2;

      const toChainTokenAddress = await toChainContract.methods
        .precalculatedWrapperAddress(networkId, importTokenAddress.value, name, symbol, decimal)
        .call();

      const toChainUserBalance = await getTokenBal({
        address: currentAccount.value,
        tokenAddress: toChainTokenAddress,
        srcChainId: toChainId,
      });

      zkToken.value = {
        name,
        symbol,
        decimal: Number(decimal),
        address: tokenAddress,
        fromChainBalance: Number(userBalance),
        toChainBalance: Number(toChainUserBalance),
        toChainTokenAddress,
      };
      await handleWrappedTokenInfo();
    } catch (error) {
      console.error(error);
      zkToken.value = undefined;
      toChainTokenAddress.value = '';
    } finally {
      isLoadingToken.value = false;
    }
  };

  const handleWrappedTokenInfo = async (): Promise<void> => {
    const contractAddress = EthBridgeContract[toChainName as EthBridgeNetworkName];
    const contract = new toWeb3Provider.value.eth.Contract(
      ZK_EVM_BRIDGE_ABI as AbiItem[],
      contractAddress
    );
    toChainTokenAddress.value = await contract.methods
      .precalculatedWrapperAddress(
        0,
        importTokenAddress.value,
        zkToken.value?.name,
        zkToken.value?.symbol,
        zkToken.value?.decimal
      )
      .call();
  };

  watch([importTokenAddress], setZkToken, { immediate: true });

  watchEffect(() => {
    // console.log('importTokenAddress', importTokenAddress.value);
  });
  return { isLoadingToken, zkToken, toChainTokenAddress };
};
