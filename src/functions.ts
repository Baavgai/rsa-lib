import { parseBigInt } from "./BigInteger";
import { hex2b64 } from "./base64";
// import { EmptyPrivateKeyData, EmptyPublicKeyData } from "./constants";
import { KeyData, PrivateKeyData, PublicKeyData } from "./types";
// import { RSAKey } from "./rsa";
import { Base64 } from "./exlib/asn1js/base64";
import { Hex } from "./exlib/asn1js/hex";
import { ASN1 } from "./exlib/asn1js/asn1";
import { KJUR } from "./exlib/jsrsasign/asn1-1.0";
import { BigInteger } from "./BigInteger";

export const isPublicKeyData = (x: any): x is PublicKeyData =>
  x && "n" in x && "e" in x && typeof x.e === "number" && !("d" in x);

export const isPrivateKeyData = (x: any): x is PrivateKeyData =>
  x && "n" in x && "e" in x && typeof x.e === "number"
  && "d" in x && "p" in x && "q" in x && "dmp1" in x && "dmq1" in x && "coeff" in x;


export const parseKey = (pem: string | KeyData): KeyData | undefined => {
  if (typeof pem !== "string") {
    return pem;
  }
  try {
    const reHex = /^\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\s*)+$/;
    const der = reHex.test(pem) ? Hex.decode(pem) : Base64.unarmor(pem);
    let asn1 = ASN1.decode(der);

    // Fixes a bug with OpenSSL 1.0+ private keys
    if (asn1.sub.length === 3) {
      asn1 = asn1.sub[2].sub[0];
    }
    if (asn1.sub.length === 9) {
      const result: PrivateKeyData = {
        // Parse the private key.
        n: parseBigInt(asn1.sub[1].getHexStringValue(), 16),
        e: parseInt(asn1.sub[2].getHexStringValue(), 16),
        d: parseBigInt(asn1.sub[3].getHexStringValue(), 16),
        p: parseBigInt(asn1.sub[4].getHexStringValue(), 16),
        q: parseBigInt(asn1.sub[5].getHexStringValue(), 16),
        dmp1: parseBigInt(asn1.sub[6].getHexStringValue(), 16),
        dmq1: parseBigInt(asn1.sub[7].getHexStringValue(), 16),
        coeff: parseBigInt(asn1.sub[8].getHexStringValue(), 16)
      };
      return result;

    } else if (asn1.sub.length === 2) {
      const sequence = asn1.sub[1].sub[0];
      const result: PublicKeyData = {
        n: parseBigInt(sequence.sub[0].getHexStringValue(), 16),
        e: parseInt(sequence.sub[1].getHexStringValue(), 16)
      };
      return result;
    }
  } catch (ex) {
  }
  return undefined;
};

export const getPublicBaseKey = (x: PublicKeyData) =>
  new KJUR.asn1.DERSequence({
    array: [
      new KJUR.asn1.DERSequence({
        array: [
          new KJUR.asn1.DERObjectIdentifier({ oid: "1.2.840.113549.1.1.1" }), // RSA Encryption pkcs #1 oid
          new KJUR.asn1.DERNull()
        ]
      }),
      new KJUR.asn1.DERBitString({
        hex: "00" + new KJUR.asn1.DERSequence({
          array: [
            new KJUR.asn1.DERInteger({ bigint: x.n }),
            new KJUR.asn1.DERInteger({ int: x.e })
          ]
        }).getEncodedHex()
      })
    ]
  }).getEncodedHex();


export const getPublicBaseKeyB64 = (x: PublicKeyData) =>
  hex2b64(getPublicBaseKey(x));


export const getPrivateBaseKey = (x: PrivateKeyData) => {
  const options = {
    array: [
      new KJUR.asn1.DERInteger({ int: 0 }),
      new KJUR.asn1.DERInteger({ bigint: x.n }),
      new KJUR.asn1.DERInteger({ int: x.e }),
      new KJUR.asn1.DERInteger({ bigint: x.d }),
      new KJUR.asn1.DERInteger({ bigint: x.p }),
      new KJUR.asn1.DERInteger({ bigint: x.q }),
      new KJUR.asn1.DERInteger({ bigint: x.dmp1 }),
      new KJUR.asn1.DERInteger({ bigint: x.dmq1 }),
      new KJUR.asn1.DERInteger({ bigint: x.coeff })
    ]
  };
  const seq = new KJUR.asn1.DERSequence(options);
  return seq.getEncodedHex();
};

export const getPrivateBaseKeyB64 = (x: PrivateKeyData) =>
  hex2b64(getPrivateBaseKey(x));

const wordwrap = (s: string, width = 64) => {
  const regex = "(.{1," + width + "})( +|$\n?)|(.{1," + width + "})";
  const result = s.match(RegExp(regex, "g"));
  return result ? result.join("\n") : undefined;
};

export const getPrivateBaseKeyText = (x: PrivateKeyData) =>
  `-----BEGIN RSA PRIVATE KEY-----\n${wordwrap(getPrivateBaseKeyB64(x))}\n-----END RSA PRIVATE KEY-----`;

export const getPublicBaseKeyText = (x: PublicKeyData) =>
  `-----BEGIN PUBLIC KEY-----\n${wordwrap(getPublicBaseKeyB64(x))}\n-----END PUBLIC KEY-----`;

