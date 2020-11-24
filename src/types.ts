import { BigInteger } from "./BigInteger";
export { BigInteger };

export interface PublicKeyData {
  n: BigInteger;
  e: number;
}

export interface PrivateKeyData extends PublicKeyData {
  d: BigInteger;
  p?: BigInteger;
  q?: BigInteger;
  dmp1: BigInteger;
  dmq1: BigInteger;
  coeff: BigInteger;
}

export type KeyData = PublicKeyData | PrivateKeyData;
