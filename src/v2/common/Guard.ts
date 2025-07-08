import { BN } from '@polkadot/util';

/**
 * Method parameters check class.
 */
export class Guard {
  /**
   * Throws Error if parameter value is not defined.
   * @param paramName Parameter name.
   * @param paramValue Parameter value.
   */
  // eslint-disable-next-line
  public static ThrowIfUndefined(paramName: string, paramValue: any): void {
    if (!paramName) {
      throw new Error('Invalid argument paramName');
    }

    if (!paramValue) {
      throw new Error(`Invalid argument ${paramName}`);
    }
  }

  /**
   * Throws Error if a parameter value is not defined or negative.
   * @param paramName Parameter name.
   * @param paramValue Parameter value.
   */
  public static ThrowIfNegative(paramName: string, paramValue: BN | number | bigint): void {
    if (!paramName) {
      throw new Error('Invalid argument paramName');
    }

    let throwError =
      (typeof paramValue === 'number' && paramValue < 0) ||
      (paramValue instanceof BN && paramValue.ltn(0));

    if (throwError) {
      throw new Error(`Invalid argument ${paramName}`);
    }
  }
}
