import type { TypeDefInfo, TypeDef } from '@polkadot/types/types';

// FIXME Ideally, we want these as Base from api-codec - as a stop-gap, any this until we have
// params returning types extending Base (i.e. anything from api-codec)
export type RawParamValue = unknown | undefined;

export type RawParamValueArray = (RawParamValue | RawParamValue[])[];

export type RawParamValues = RawParamValue | RawParamValueArray;

export interface RawParam {
  isValid: boolean;
  value: RawParamValues;
}

export interface RawParamOnChangeValue {
  isValid: boolean;
  value: RawParamValues;
}

export type RawParamOnChange = (value: RawParamOnChangeValue) => void;
export type RawParamOnEnter = () => void;
export type RawParamOnEscape = () => void;

export type RawParams = RawParam[];

export interface ParamDef {
  length?: number;
  name?: string;
  type: TypeDef;
}

///////////////////////////////////////////////////////////
// the types below are not from polkadot app

export type Param = {
  type: string;
  info: TypeDefInfo;
  value: ParamValue;
};

export type ParamValue = string | { balance: string; unit: string };
