import { EthReceipt } from '@polkadot/types/interfaces';
import BN from 'bn.js';
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

  getContractStake = async (contract_id: string) => {
    return await this.ci.methods.read_contract_stake(contract_id).call();
  };

  /* extrinsic calls */
  callRegister = (contractAddr: string) => {
    return new Promise((resolve, reject) => {
      this.ci.methods
        .register(contractAddr)
        .send({ from: this.fromAddr })
        .on('transactionHash', (hash: string) => {
          console.log('hash', hash);
        })
        .on('receipt', (receipt: EthReceipt) => {
          resolve(receipt.transactionHash);
        })
        .on('error', (error: Error) => {
          reject(error.message);
        });
    });
  };

  callBondAndStake = (contractAddr: string, amount: BN) => {
    return new Promise((resolve, reject) => {
      this.ci.methods
        .bond_and_stake(contractAddr, amount)
        .send({ from: this.fromAddr })
        .on('transactionHash', (hash: string) => {
          console.log('hash', hash);
        })
        .on('receipt', (receipt: EthReceipt) => {
          resolve(receipt.transactionHash);
        })
        .on('error', (error: Error) => {
          reject(error.message);
        });
    });
  };

  callUnbondAndUnstake = (contractAddr: string, amount: BN) => {
    return new Promise((resolve, reject) => {
      this.ci.methods
        .unbond_and_unstake(contractAddr, amount)
        .send({ from: this.fromAddr })
        .on('transactionHash', (hash: string) => {
          console.log('hash', hash);
        })
        .on('receipt', (receipt: EthReceipt) => {
          resolve(receipt.transactionHash);
        })
        .on('error', (error: Error) => {
          reject(error.message);
        });
    });
  };

  callWithdrawUnbonded = () => {
    return new Promise((resolve, reject) => {
      this.ci.methods
        .withdraw_unbonded()
        .send({ from: this.fromAddr })
        .on('transactionHash', (hash: string) => {
          console.log('hash', hash);
        })
        .on('receipt', (receipt: EthReceipt) => {
          resolve(receipt.transactionHash);
        })
        .on('error', (error: Error) => {
          reject(error.message);
        });
    });
  };

  callClaim = (contractAddr: string, era: number) => {
    return new Promise((resolve, reject) => {
      this.ci.methods
        .claim(contractAddr, era)
        .send({ from: this.fromAddr })
        .on('transactionHash', (hash: string) => {
          console.log('hash', hash);
        })
        .on('receipt', (receipt: EthReceipt) => {
          resolve(receipt.transactionHash);
        })
        .on('error', (error: Error) => {
          reject(error.message);
        });
    });
  };
}
