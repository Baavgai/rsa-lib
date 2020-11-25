import { PrivateKeyData, PublicKeyData } from "./types";
import * as fmtFuncs from "./functions";
import * as keyFuncs from "./rsa";

const DEFAULT_KEY_SIZE = 1024;
const DEFAULT_PUBLIC_EXPONENT = "010001";

export type KeyFormat = "hex" | "base64" | "wrapped";

export interface PublicKey {
    readonly publicOnly: boolean;
    readonly bitLength: number;
    getPublicKey: (type?: KeyFormat) => string;
    encrypt: (text: string) => string;
    verify: (text: string, signature: string, digestMethod?: (str: string) => string) => boolean;
}

export interface PrivateKey extends PublicKey {
    getPrivateKey: (type?: KeyFormat) => string;
    decrypt: (text: string) => string | undefined;
    sign: (text: string, digestMethod?: (str: string) => string, digestName?: string) => string;
}

export const isPrivate = (x: PublicKey | PrivateKey): x is PrivateKey =>
  x && x.publicOnly === false;

export const createKey = (pem: string): PublicKey | PrivateKey | undefined => {
    const data = fmtFuncs.parseKey(pem);
    if (fmtFuncs.isPrivateKeyData(data)) {
        return new PrivateKeyImpl(data);
    } else if (fmtFuncs.isPublicKeyData(data)) {
        return new PublicKeyImpl(data);
    } else {
        return undefined;
    }
};

export const generateKey = (keySize: number = DEFAULT_KEY_SIZE, publicExponent = DEFAULT_PUBLIC_EXPONENT): PrivateKey =>
    new PrivateKeyImpl(keyFuncs.generatePrivateKey(keySize, publicExponent));

class PublicKeyImpl implements PublicKey {
    constructor(private pubDat: PublicKeyData) { }
    // get raw() { return this.pubDat; }
    get bitLength() { return this.pubDat.n.bitLength(); }
    get publicOnly() { return true; }
    getPublicKey = (type?: KeyFormat) => {
        if (type === "hex") {
            return fmtFuncs.getPublicBaseKey(this.pubDat);
        } else if (type === "wrapped") {
            return fmtFuncs.getPublicBaseKeyText(this.pubDat);
        } else {
            return fmtFuncs.getPublicBaseKeyB64(this.pubDat);
        }
    }
    encrypt = (text: string) => keyFuncs.encrypt(this.pubDat, text);
    verify = (text: string, signature: string, digestMethod?: (str: string) => string) =>
        keyFuncs.verify(this.pubDat, text, signature, digestMethod ?? ((x: string) => x));
}


class PrivateKeyImpl extends PublicKeyImpl implements PrivateKey {
    constructor(private privDat: PrivateKeyData) { super(privDat); }
    // get raw() { return this.privDat; }
    get publicOnly() { return false; }

    getPrivateKey = (type?: KeyFormat) => {
        if (type === "hex") {
            return fmtFuncs.getPrivateBaseKey(this.privDat);
        } else if (type === "wrapped") {
            return fmtFuncs.getPrivateBaseKeyText(this.privDat);
        } else {
            return fmtFuncs.getPrivateBaseKeyB64(this.privDat);
        }
    }
    decrypt = (text: string) => keyFuncs.decrypt(this.privDat, text);
    sign = (text: string, digestMethod?: (str: string) => string, digestName?: string) =>
        keyFuncs.sign(this.privDat, text, digestMethod ?? ((x: string) => x), digestName ?? "passthru");
}

/*
export type KeyType = PublicKey | PrivateKey;

export const isPublic = (x: any): x is PublicKey =>
  x && "n" in x && "e" in x && typeof x.e === "number" && !("d" in x);

export const isPrivate = (x: any): x is PrivateKey =>
  x && "n" in x && "e" in x && typeof x.e === "number" && !("d" in x);


*/