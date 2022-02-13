import type { Contract } from 'web3-eth-contract/types';

export class Staking {
  public ci: Contract;
  public fromAddr: string;
  constructor(contractInstance: Contract, fromAddress: string) {
    this.ci = contractInstance;
    this.fromAddr = fromAddress;
  }

  /* view getters */
  getCurrentEra = async () => {
    return await this.ci.methods.read_current_era().call();
  };

  getUnbondingPeriod = async () => {
    return await this.ci.methods.read_unbonding_period().call();
  };

  getEraReward = async (era: number) => {
    return await this.ci.methods.read_era_reward(era).call();
  };

  getEraStaked = async (era: number) => {
    return await this.ci.methods.read_era_staked(era).call();
  };

  getStakedAmount = async (staker: string) => {
    return await this.ci.methods.read_staked_amount(staker).call();
  };

  getContractEraStake = async (contract_id: string, era: number) => {
    return await this.ci.methods.read_contract_era_stake(contract_id, era).call();
  };

  /* extrinsic calls */
  callRegister = async (contractAddr: string) => {
    return await this.ci.methods.register(contractAddr).send({ from: this.fromAddr });
  };

  callBondAndStake = async (contractAddr: string, amount: number) => {
    return await this.ci.methods.bond_and_stake(contractAddr, amount).send({ from: this.fromAddr });
  };

  callUnbondAndUnstake = async (contractAddr: string, amount: number) => {
    return await this.ci.methods
      .unbond_and_unstake(contractAddr, amount)
      .send({ from: this.fromAddr });
  };

  callWithdrawUnbonded = async () => {
    return await this.ci.methods.withdraw_unbonded().send({ from: this.fromAddr });
  };

  callClaim = async (contractAddr: string, amount: number) => {
    return await this.ci.methods.claim(contractAddr, amount).send({ from: this.fromAddr });
  };
}
