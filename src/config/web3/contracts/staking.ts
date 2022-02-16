import type { Contract } from 'web3-eth-contract/types';

export class Staking {
  public ci: Contract;
  public fromAddr: string;
  constructor(contractInstance: Contract, fromAddress: string = '') {
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
  callRegister = (contractAddr: string) => {
    return new Promise((resolve, reject) => {
      this.ci.methods
        .register(contractAddr)
        .send({ from: this.fromAddr })
        .on('transactionHash', (hash: string) => {
          resolve(hash);
        })
        .on('error', (error: any) => {
          reject(error);
        });
    });
  };

  callBondAndStake = (contractAddr: string, amount: number) => {
    return new Promise((resolve, reject) => {
      this.ci.methods
        .bond_and_stake(contractAddr, amount)
        .send({ from: this.fromAddr })
        .on('transactionHash', (hash: string) => {
          resolve(hash);
        })
        .on('error', (error: any) => {
          reject(error);
        });
    });
  };

  callUnbondAndUnstake = (contractAddr: string, amount: number) => {
    return new Promise((resolve, reject) => {
      this.ci.methods
        .unbond_and_unstake(contractAddr, amount)
        .send({ from: this.fromAddr })
        .on('transactionHash', (hash: string) => {
          resolve(hash);
        })
        .on('error', (error: any) => {
          reject(error);
        });
    });
  };

  callWithdrawUnbonded = () => {
    return new Promise((resolve, reject) => {
      this.ci.methods
        .withdraw_unbonded()
        .send({ from: this.fromAddr })
        .on('transactionHash', (hash: string) => {
          resolve(hash);
        })
        .on('error', (error: any) => {
          reject(error);
        });
    });
  };

  callClaim = (contractAddr: string, amount: number) => {
    return new Promise((resolve, reject) => {
      this.ci.methods
        .claim(contractAddr, amount)
        .send({ from: this.fromAddr })
        .on('transactionHash', (hash: string) => {
          resolve(hash);
        })
        .on('error', (error: any) => {
          reject(error);
        });
    });
  };
}
