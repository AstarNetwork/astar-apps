import { isValidEvmAddress } from '@astar-network/astar-sdk-core';
import ABI from 'src/config/abi/ERC20.json';
import { buildWeb3Instance, getTokenBal, getTokenImage } from 'src/config/web3';
import { useAccount } from 'src/hooks';
import { Erc20Token, storeImportedERC20Token } from 'src/modules/token';
import {
  EthBridgeChainId,
  EthBridgeNetworkName,
  ZkChainId,
  ZkToken,
  getBridgedTokenAddress,
} from 'src/modules/zk-evm-bridge';
import { Ref, computed, ref, watch } from 'vue';
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
    const toChainWeb3 = toWeb3Provider.value;
    const tokenAddress = importTokenAddress.value;
    try {
      isLoadingToken.value = true;
      if (!tokenAddress || !isValidEvmAddress(tokenAddress) || !fromChainWeb3 || !toChainWeb3) {
        return;
      }

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

      const toChainTokenAddress = await getBridgedTokenAddress({
        srcChainId: fromChainId,
        tokenAddress,
        name,
        symbol,
        decimal,
      });

      const isFromEthChains =
        fromChainId === ZkChainId.Ethereum || fromChainId === ZkChainId.Sepolia;
      const ethereumAddress = isFromEthChains ? tokenAddress : toChainTokenAddress;
      const logoURI = await getTokenImage({ symbol, address: ethereumAddress });

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
        image: logoURI,
      };
    } catch (error) {
      console.error(error);
      zkToken.value = undefined;
      toChainTokenAddress.value = '';
    } finally {
      isLoadingToken.value = false;
    }
  };

  const storeImportToken = async (): Promise<void> => {
    try {
      const fromChainWeb3 = web3Provider.value;
      const tokenAddress = importTokenAddress.value;
      const contract = new fromChainWeb3.eth.Contract(ABI as AbiItem[], tokenAddress);

      const [decimal, name, symbol] = await Promise.all([
        contract.methods.decimals().call(),
        contract.methods.name().call(),
        contract.methods.symbol().call(),
      ]);

      const toChainTokenAddress = await getBridgedTokenAddress({
        srcChainId: fromChainId,
        tokenAddress,
        name,
        symbol,
        decimal,
      });

      const fromChainToken: Erc20Token = {
        srcChainId: fromChainId,
        address: tokenAddress,
        decimal: decimal,
        symbol: symbol,
        name,
        image: zkToken.value?.image,
        isWrappedToken: false,
        isXC20: false,
        wrapUrl: null,
        bridgedTokenAddress: toChainTokenAddress,
        bridgedChainId: toChainId,
      };

      const destChainToken: Erc20Token = {
        srcChainId: toChainId,
        address: toChainTokenAddress,
        decimal: decimal,
        symbol: symbol,
        name,
        image: zkToken.value?.image,
        isWrappedToken: false,
        isXC20: false,
        wrapUrl: null,
        bridgedTokenAddress: tokenAddress,
        bridgedChainId: fromChainId,
      };

      storeImportedERC20Token(fromChainToken);
      storeImportedERC20Token(destChainToken);
    } catch (error) {
      console.error(error);
    }
  };

  watch([importTokenAddress], setZkToken, { immediate: true });

  return { isLoadingToken, zkToken, toChainTokenAddress, storeImportToken };
};
