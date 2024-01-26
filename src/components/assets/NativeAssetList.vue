<template>
  <div>
    <div v-if="nativeTokenSymbol">
      <!-- Total balance -->
      <div class="row--header">
        <div class="row--header__left">
          <div v-if="nativeTokenSymbol && currentNetworkName" class="column--token-name">
            <img width="24" :src="nativeTokenImg" :alt="nativeTokenSymbol" />
            <span class="text--title">{{ nativeTokenSymbol }}</span>
          </div>
          <div v-else>
            <q-skeleton animation="fade" class="skeleton--md" />
          </div>
        </div>
        <div class="row--header__right">
          <div v-if="!isSkeleton" class="column--balance">
            <div class="column--amount text--amount">
              {{ $n(truncate(bal, 3)) }}
            </div>
            <div class="column--symbol text--symbol">{{ nativeTokenSymbol }}</div>
          </div>
          <div v-else class="skeleton--right">
            <q-skeleton animation="fade" class="skeleton--md" />
          </div>
        </div>
      </div>

      <div class="separator" />

      <!-- Transferable -->
      <div class="row row--transferable">
        <div class="row__info">
          <div class="column--label text--label">
            {{ $t('assets.transferable') }}
          </div>
          <div v-if="!isSkeleton" class="column--balance">
            <span class="column--amount text--amount">
              {{ $n(truncate(transferableBalance, 3)) }}
            </span>
            <span class="column--symbol text--symbol">{{ nativeTokenSymbol }}</span>
          </div>
          <div v-else>
            <div class="skeleton--right">
              <q-skeleton animation="fade" class="skeleton--md" />
            </div>
          </div>
        </div>

        <div class="row__actions">
          <template v-if="isShibuya">
            <router-link :to="buildTransferPageLink(nativeTokenSymbol)">
              <button class="btn btn--icon">
                <astar-icon-transfer />
              </button>
              <span class="text--mobile-menu">{{ $t('assets.send') }}</span>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('assets.send') }}</span>
              </q-tooltip>
            </router-link>
          </template>

          <div v-if="isFaucet">
            <button class="btn btn--icon" @click="handleModalFaucet({ isOpen: true })">
              <astar-icon-faucet />
            </button>
            <span class="text--mobile-menu">{{ $t('assets.faucet') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('assets.faucet') }}</span>
            </q-tooltip>
          </div>
          <template v-else>
            <router-link
              :to="buildTransferPageLink(nativeTokenSymbol)"
              data-testid="transfer-link-button"
            >
              <button class="btn btn--icon">
                <astar-icon-transfer />
              </button>
              <span class="text--mobile-menu">{{ $t('assets.send') }}</span>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('assets.send') }}</span>
              </q-tooltip>
            </router-link>
          </template>
        </div>
      </div>

      <!-- Evm Deposit -->
      <div v-if="numEvmDeposit" class="row row--evm-deposit">
        <div class="row--inner-container">
          <div class="row__info">
            <div class="column--label text--label">
              {{ $t('assets.evmDeposit') }}
            </div>
            <div v-if="!isSkeleton" class="column--balance">
              <span class="column--amount text--amount">
                {{ $n(truncate(numEvmDeposit, 3)) }}
              </span>
              <span class="column--symbol text--symbol">{{ nativeTokenSymbol }}</span>
            </div>
            <div v-else>
              <div class="skeleton--right">
                <q-skeleton animation="fade" class="skeleton--md" />
              </div>
            </div>
          </div>
          <div class="row__actions">
            <button class="btn btn--sm" @click="handleModalEvmWithdraw({ isOpen: true })">
              {{ $t('assets.withdraw') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Locked tokens -->
      <div class="row row--locked-tokens">
        <div class="row--inner-container">
          <div class="row__info">
            <div class="column--label text--label">
              {{ $t('assets.lockedTokens') }}
            </div>
            <div v-if="!isSkeleton" class="column--balance">
              <div class="column--amount text--amount">
                {{ $n(truncate(lockInDappStaking + vestingTtl + reservedTtl, 3)) }}
              </div>
              <div class="column--symbol text--symbol">
                {{ nativeTokenSymbol }}
              </div>
            </div>
            <div v-else>
              <div class="skeleton--right">
                <q-skeleton animation="fade" class="skeleton--md" />
              </div>
            </div>
          </div>

          <div class="row__actions">
            <button
              class="icon--expand"
              :class="isExpand && 'icon--collapse'"
              @click="expandAsset(isExpand)"
            >
              <astar-icon-base>
                <astar-icon-3dots />
              </astar-icon-base>
              <q-tooltip>
                <span class="text--tooltip">
                  {{ $t(isExpand ? 'assets.collapse' : 'assets.expand') }}
                </span>
              </q-tooltip>
            </button>
          </div>
        </div>

        <div class="expand-container">
          <div :id="isExpand ? 'asset-expand' : 'asset-expand-close'" class="rows--expand">
            <!-- Vesting -->
            <div class="row--expand">
              <div class="row--expand__info">
                <div class="column--label text--label">{{ $t('assets.vesting') }}</div>
                <div class="column--balance">
                  <template v-if="!isSkeleton">
                    <div class="column--amount text--amount">
                      {{ $n(truncate(vestingTtl, 3)) }}
                    </div>
                    <div class="column--symbol text--symbol">
                      {{ nativeTokenSymbol }}
                    </div>
                    <div v-if="vestingTtl > 0" class="row--vesting-note">
                      <span>
                        {{
                          $t('assets.vestingInStake', {
                            amount: $n(
                              truncate(
                                vestingTtl > lockInDappStaking ? lockInDappStaking : vestingTtl,
                                3
                              )
                            ),
                            token: nativeTokenSymbol,
                          })
                        }}
                      </span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="skeleton--right">
                      <q-skeleton animation="fade" class="skeleton--md" />
                    </div>
                  </template>
                </div>
              </div>
              <div class="row--expand__action">
                <button class="btn btn--sm" @click="handleModalVesting({ isOpen: true })">
                  {{ $t('assets.view') }}
                </button>
              </div>
            </div>

            <!-- Reserved -->
            <div class="row--expand">
              <div class="row--expand__info">
                <div class="column--label text--label">{{ $t('assets.reserved') }}</div>
                <div class="column--balance">
                  <template v-if="!isSkeleton">
                    <div class="column--amount text--amount">
                      {{ $n(truncate(reservedTtl, 3)) }}
                    </div>
                    <div class="column--symbol text--symbol">
                      {{ nativeTokenSymbol }}
                    </div>
                  </template>
                  <template v-else>
                    <div class="skeleton--right">
                      <q-skeleton animation="fade" class="skeleton--md" />
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- Staking -->
            <div class="row--expand">
              <div class="row--expand__info">
                <div class="column--label text--label">{{ $t('common.staking') }}</div>
                <div class="column--balance">
                  <template v-if="!isSkeleton">
                    <div class="column--amount text--amount">
                      {{ $n(truncate(lockInDappStaking, 3)) }}
                    </div>
                    <div class="column--symbol text--symbol">
                      {{ nativeTokenSymbol }}
                    </div>
                  </template>
                  <template v-else>
                    <div class="skeleton--right">
                      <q-skeleton animation="fade" class="skeleton--md" />
                    </div>
                  </template>
                </div>
              </div>
              <div class="row--expand__action">
                <router-link :to="Path.DappStaking">
                  <button class="btn btn--sm">{{ $t('manage') }}</button>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <modal-faucet :is-modal-faucet="isModalFaucet" :handle-modal-faucet="handleModalFaucet" />
    <modal-evm-withdraw
      :is-modal-evm-withdraw="isModalEvmWithdraw"
      :handle-modal-evm-withdraw="handleModalEvmWithdraw"
      :native-token-symbol="nativeTokenSymbol"
    />
    <modal-vesting
      :is-modal-vesting="isModalVesting"
      :handle-modal-vesting="handleModalVesting"
      :native-token-symbol="nativeTokenSymbol"
      :account-data="accountData"
    />
  </div>
</template>
<script lang="ts">
import { checkIsNullOrUndefined, truncate } from '@astar-network/astar-sdk-core';
import { u8aToString } from '@polkadot/util';
import { ethers } from 'ethers';
import ModalEvmWithdraw from 'src/components/assets/modals/ModalEvmWithdraw.vue';
import ModalFaucet from 'src/components/assets/modals/ModalFaucet.vue';
import ModalVesting from 'src/components/assets/modals/ModalVesting.vue';
import {
  useBalance,
  useBreakpoints,
  useEvmDeposit,
  useFaucet,
  useNetworkInfo,
  usePrice,
} from 'src/hooks';
import { getTokenImage } from 'src/modules/token';
import { generateAstarNativeTokenObject } from 'src/modules/xcm/tokens';
import { Path } from 'src/router';
import { buildTransferPageLink } from 'src/router/routes';
import { useDappStaking } from 'src/staking-v3';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';

export default defineComponent({
  components: {
    ModalFaucet,
    ModalEvmWithdraw,
    ModalVesting,
  },
  setup() {
    const isModalTransfer = ref<boolean>(false);
    const isModalFaucet = ref<boolean>(false);
    const isModalEvmWithdraw = ref<boolean>(false);
    const isModalVesting = ref<boolean>(false);
    const bal = ref<number>(0);
    const balUsd = ref<number | null>(null);
    const vestingTtl = ref<number>(0);
    const reservedTtl = ref<number>(0);
    const lockInDappStaking = ref<number>(0);
    const isRocstar = ref<boolean>(false);
    const isShibuya = ref<boolean>(false);
    const isFaucet = ref<boolean>(false);
    const isExpand = ref<boolean>(false);

    const store = useStore();
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const { balance, accountData, isLoadingBalance } = useBalance(selectedAddress);
    const { numEvmDeposit } = useEvmDeposit();
    const { nativeTokenUsd } = usePrice();
    const { currentNetworkName, nativeTokenSymbol, isSupportAuTransfer } = useNetworkInfo();
    const { faucetBalRequirement } = useFaucet();
    const { isDappStakingV3, ledger } = useDappStaking();
    const xcmNativeToken = computed(() => generateAstarNativeTokenObject(nativeTokenSymbol.value));

    const nativeTokenImg = computed(() =>
      getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
    );

    const transferableBalance = computed<string>(() => {
      return accountData.value
        ? ethers.utils.formatEther(accountData.value.getUsableTransactionBalance().toString())
        : '0';
    });

    const isSkeleton = computed<boolean>(() => {
      return checkIsNullOrUndefined(nativeTokenSymbol.value) || isLoadingBalance.value;
    });

    const handleModalFaucet = ({ isOpen }: { isOpen: boolean }) => {
      isModalFaucet.value = isOpen;
    };
    const handleModalEvmWithdraw = ({ isOpen }: { isOpen: boolean }) => {
      isModalEvmWithdraw.value = isOpen;
    };
    const handleModalVesting = ({ isOpen }: { isOpen: boolean }) => {
      isModalVesting.value = isOpen;
    };

    const setBalanceData = (): void => {
      const tokenSymbolRef = nativeTokenSymbol.value;
      if (!balance.value || !tokenSymbolRef) return;
      try {
        bal.value = Number(ethers.utils.formatEther(balance.value.toString()));
        isShibuya.value = tokenSymbolRef === 'SBY';
        isRocstar.value = tokenSymbolRef === 'RSTR';
        isFaucet.value = isRocstar.value
          ? false
          : isShibuya.value || faucetBalRequirement.value > bal.value;
        if (nativeTokenUsd.value) {
          balUsd.value = nativeTokenUsd.value * bal.value;
        } else {
          balUsd.value = 0;
        }
      } catch (error: any) {
        console.error(error.message);
      }
    };

    watch([nativeTokenSymbol, balance], setBalanceData, { immediate: false });

    watchEffect(() => {
      const accountDataRef = accountData.value;
      if (!accountDataRef) return;
      // Memo: `vesting ` -> there has been inputted 1 space here
      const vesting = accountDataRef.locks.find((it) => u8aToString(it.id) === 'vesting ');
      const dappStake = accountDataRef.locks.find((it) => u8aToString(it.id) === 'dapstake');
      const reserved = accountDataRef.reserved;
      if (vesting) {
        const amount = String(vesting.amount);
        vestingTtl.value = Number(ethers.utils.formatEther(amount));
      }
      if (dappStake) {
        const amount = String(dappStake.amount);
        lockInDappStaking.value = Number(ethers.utils.formatEther(amount));
      } else if (isDappStakingV3.value && ledger.value) {
        lockInDappStaking.value = Number(ethers.utils.formatEther(ledger.value.locked));
      }

      if (reserved) {
        const amount = reserved.toString();
        reservedTtl.value = Number(ethers.utils.formatEther(amount));
      }
    });

    // Ref: https://stackoverflow.com/questions/48143381/css-expand-contract-animation-to-show-hide-content
    const expandAsset = async (isOpen: boolean): Promise<void> => {
      isExpand.value = !isOpen;
      const el = document.getElementById(isOpen ? 'asset-expand' : 'asset-expand-close');
      el && el.classList.toggle('asset-expanded');
      el && el.classList.toggle('asset-collapsed');
    };

    const { width, screenSize } = useBreakpoints();

    return {
      bal,
      nativeTokenSymbol,
      balUsd,
      currentNetworkName,
      numEvmDeposit,
      isShibuya,
      vestingTtl,
      lockInDappStaking,
      isFaucet,
      transferableBalance,
      isModalTransfer,
      accountData,
      nativeTokenImg,
      isModalFaucet,
      isModalEvmWithdraw,
      isModalVesting,
      xcmNativeToken,
      isLoading,
      Path,
      isSkeleton,
      isSupportAuTransfer,
      isExpand,
      width,
      screenSize,
      reservedTtl,
      truncate,
      buildTransferPageLink,
      handleModalVesting,
      handleModalFaucet,
      handleModalEvmWithdraw,
      expandAsset,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
