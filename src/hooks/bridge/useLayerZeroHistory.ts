import { createClient } from '@layerzerolabs/scan-client';
import { watchEffect } from 'vue';

export const useLayerZeroHistory = () => {
  const fetchUserHistory = async () => {
    const client = createClient('mainnet');
    const { messages } = await client.getMessagesBySrcTxHash(
      '0x37421f702da83228ca7d5a5dde96f9506fc594cc949485504068d22d68003c94'
    );
    console.log('messages', messages);
  };

  watchEffect(fetchUserHistory);

  return {};
};
