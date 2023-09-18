import { Data, Option } from '@polkadot/types';
import { PalletIdentityIdentityInfo, PalletIdentityRegistration } from '@polkadot/types/lookup';
import { IdentityInfoAdditional } from '@polkadot/types/interfaces';
import { inject, injectable } from 'inversify';
import { Guard } from 'src/v2/common';
import { ExtrinsicPayload, IApi } from 'src/v2/integration';
import { IdentityData } from 'src/v2/models';
import { IIdentityRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { ApiPromise } from '@polkadot/api';

@injectable()
export class IdentityRepository implements IIdentityRepository {
  constructor(@inject(Symbols.DefaultApi) private readonly api: IApi) {}

  public async getIdentity(address: string): Promise<IdentityData> {
    Guard.ThrowIfUndefined('address', address);
    const api = await this.api.getApi();
    const identity = await api.query.identity.identityOf<PalletIdentityRegistration>(address);
    const data = new IdentityData(identity.info.toString());

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