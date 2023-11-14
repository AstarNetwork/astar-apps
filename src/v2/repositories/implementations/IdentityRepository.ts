import { Data, Option } from '@polkadot/types';
import { PalletIdentityIdentityInfo, PalletIdentityRegistration } from '@polkadot/types/lookup';
import { IdentityInfoAdditional } from '@polkadot/types/interfaces';
import { inject, injectable } from 'inversify';
import { Guard } from 'src/v2/common';
import { ExtrinsicPayload, IApi } from 'src/v2/integration';
import { Deposit, IdentityData } from 'src/v2/models';
import { IIdentityRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { ApiPromise } from '@polkadot/api';
import { u8aToString } from '@polkadot/util';

@injectable()
export class IdentityRepository implements IIdentityRepository {
  constructor(@inject(Symbols.DefaultApi) private readonly api: IApi) {}

  public async getDepositInfo(): Promise<Deposit> {
    const api = await this.api.getApi();

    const [basic, field] = await Promise.all([
      api.consts.identity.basicDeposit.toBigInt(),
      api.consts.identity.fieldDeposit.toBigInt(),
    ]);

    return {
      basic,
      field,
    };
  }

  public async getIdentity(address: string): Promise<IdentityData | undefined> {
    Guard.ThrowIfUndefined('address', address);
    const api = await this.api.getApi();

    if (!api.query.identity) {
      return undefined;
    }

    const result = await api.query.identity.identityOf<Option<PalletIdentityRegistration>>(address);

    if (result.isNone) {
      return undefined;
    }

    const identity = result.unwrapOrDefault();
    const data = new IdentityData(u8aToString(identity.info.display.asRaw), []);
    identity.info.additional.forEach((x) => {
      // Seems dirty. The problem here is that some raw data is treated as ASCII and some as bytes
      data.additional?.push({
        key: JSON.parse(JSON.stringify(x[0].toHuman())).Raw,
        value: JSON.parse(JSON.stringify(x[1].toHuman())).Raw,
      });
    });

    return data;
  }

  public async getSetIdentityCall(address: string, data: IdentityData): Promise<ExtrinsicPayload> {
    Guard.ThrowIfUndefined('data', data);

    const api = await this.api.getApi();
    const registrationOption = await api.query.identity.identityOf<
      Option<PalletIdentityRegistration>
    >(address);
    let registration = registrationOption.isSome ? registrationOption.unwrap() : undefined;
    let payload = {} as PalletIdentityIdentityInfo;

    if (registration !== undefined) {
      // Update identity.
      switch (true) {
        case !!data.display:
          registration.info.set('display', this.createRawData(api, data.display));
        case !!data.additional:
          data.additional?.forEach((x) => {
            // Check if additional field already exists in identity.
            const additional = registration?.info.additional.find(
              (y) => y[0].value.toHuman() === x.key
            );
            if (additional) {
              // Update the existing additional field value.
              additional[1] = this.createRawData(api, x.value);
            } else {
              // Add a new additional field.
              const additionalItem = this.crateAdditionalData(api, x.key, x.value);
              registration?.info.additional.push(additionalItem);
            }
          });
      }

      payload = registration.info;
    } else {
      // Create a new identity.
      const additional =
        data.additional?.map((x) => this.crateAdditionalData(api, x.key, x.value)) ?? [];

      payload = {
        display: this.createRawData(api, data.display),
        additional,
      } as PalletIdentityIdentityInfo;
    }
    const call = api.tx.identity.setIdentity(payload);

    return call;
  }

  private createRawData(api: ApiPromise, data?: string): Data {
    return new Data(api.registry, { raw: data });
  }

  private crateAdditionalData(
    api: ApiPromise,
    key?: string,
    value?: string
  ): IdentityInfoAdditional {
    return <IdentityInfoAdditional>(
      api.registry.createType('IdentityInfoAdditional', [
        new Data(api.registry, { raw: key }),
        new Data(api.registry, { raw: value }),
      ])
    );
  }
}
