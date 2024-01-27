import { watchEffect } from 'vue';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import Web3 from 'web3';
import { setupNetwork } from 'src/config/web3';

export const useWalletConnect = () => {
  const rpcUrl = 'https://evm.astar.network';
  const projectId = 'c236cca5c68248680dd7d0bf30fefbb5';
  const explorerUrl = 'https://blockscout.com/astar';

  watchEffect(async () => {
    let provider;

    const getProvider = async () => {
      return (await EthereumProvider.init({
        projectId, // REQUIRED your projectId
        showQrModal: true, // REQUIRED set to "true" to use @walletconnect/modal

        /* Optional Namespaces - RECOMMENDED FOR MULTI-CHAIN APPS */
        optionalChains: [592], // chains - required for optional namespaces
        optionalMethods: ['wallet_switchEthereumChain', 'wallet_addEthereumChain'], // ethereum methods - all ethereum methods are already set by default so this is not required
        // optionalEvents, // ethereum events - all ethereum events are already set by default so this is not required

        /* Required Namespaces - NOT RECOMMENDED FOR MULTI-CHAIN APPS*/
        chains: [1], //  chain ids
        methods: [
          'eth_sign',
          'eth_signTypedData',
          'personal_sign',
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_signTypedData_v4',
          'eth_signTypedData_v3',
          'eth_signTypedData_v2',
          'eth_signTypedData',
          'wallet_switchEthereumChain',
          'wallet_addEthereumChain',
        ], // ethereum methods
        // events, // ethereum events

        rpcMap: {
          '592': rpcUrl,
        }, // OPTIONAL rpc urls for each chain
        // metadata, // OPTIONAL metadata of your app
        // qrModalOptions // OPTIONAL - `undefined` by default, see https://docs.walletconnect.com/web3modal/options
      })) as any;
    };

    try {
      provider = await getProvider();
    } catch (error) {
      console.error(error);
      indexedDB.deleteDatabase('WALLET_CONNECT_V2_INDEXED_DB');
      console.log(1);
      provider = await getProvider();
      console.log(2);
    }

    await provider.connect();

    try {
      await provider.enable();
      const result = await provider.request({ method: 'eth_requestAccounts' });
      const senderAddress = result[0];
      // await setupNetwork({ provider, network: 592 });
      // const web3 = new Web3(provider);
      // const tx = {
      //   from: senderAddress,
      //   to: senderAddress,
      //   value: web3.utils.toWei(String(1), 'ether'),
      // };
      // const hash = await web3.eth.sendTransaction(tx);
    } catch (error) {
      console.error('Error switching network:', error);
    }
  });

  return {};
};
