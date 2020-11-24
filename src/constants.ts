/*
import { BigInteger } from "./BigInteger";
import { PrivateKeyData, PublicKeyData } from "./types";

export const EmptyPrivateKeyData: PrivateKeyData = {
  n: BigInteger.ZERO,
  e: 0,
  d: BigInteger.ZERO,
  p: BigInteger.ZERO,
  q: BigInteger.ZERO,
  dmp1: BigInteger.ZERO,
  dmq1: BigInteger.ZERO,
  coeff: BigInteger.ZERO,
} as const;

export const EmptyPublicKeyData: PublicKeyData = {
  n: BigInteger.ZERO,
  e: 0
} as const;
*/

export const DEFAULT_KEY_SIZE = 1024;
export const DEFAULT_PUBLIC_EXPONENT = "010001";

// https://tools.ietf.org/html/rfc3447#page-43
export const DIGEST_HEADERS: { [name: string]: string } = {
    md2: "3020300c06082a864886f70d020205000410",
    md5: "3020300c06082a864886f70d020505000410",
    sha1: "3021300906052b0e03021a05000414",
    sha224: "302d300d06096086480165030402040500041c",
    sha256: "3031300d060960864801650304020105000420",
    sha384: "3041300d060960864801650304020205000430",
    sha512: "3051300d060960864801650304020305000440",
    ripemd160: "3021300906052b2403020105000414",
};
