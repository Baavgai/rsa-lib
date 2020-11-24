import { BigInteger, parseBigInt, secureRandom as rng } from "./BigInteger";
import {  PrivateKeyData, PublicKeyData } from "./types";

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


function getDigestHeader(name: string): string {
    return DIGEST_HEADERS[name] || "";
}

function removeDigestHeader(str: string): string {
    for (const name in DIGEST_HEADERS) {
        // eslint-disable-next-line no-prototype-builtins
        if (DIGEST_HEADERS.hasOwnProperty(name)) {
            const header = DIGEST_HEADERS[name];
            const len = header.length;
            if (str.substr(0, len) == header) {
                return str.substr(len);
            }
        }
    }
    return str;
}

function pkcs1pad1(s: string, n: number) {
    if (n < s.length + 22) {
        throw new Error("Message too long for RSA");
        // console.error("Message too long for RSA");
        // return null;
    }
    const len = n - s.length - 6;
    let filler = "";
    for (let f = 0; f < len; f += 2) {
        filler += "ff";
    }
    const m = "0001" + filler + "00" + s;
    return parseBigInt(m, 16);
}

// PKCS#1 (type 2, random) pad input string s to n bytes, and return a bigint
function pkcs1pad2(s: string, n: number) {
    if (n < s.length + 11) { // TODO: fix for utf-8
        throw new Error("Message too long for RSA");
    }
    const ba = [];
    let i = s.length - 1;
    while (i >= 0 && n > 0) {
        const c = s.charCodeAt(i--);
        if (c < 128) { // encode using utf-8
            ba[--n] = c;
        } else if ((c > 127) && (c < 2048)) {
            ba[--n] = (c & 63) | 128;
            ba[--n] = (c >> 6) | 192;
        } else {
            ba[--n] = (c & 63) | 128;
            ba[--n] = ((c >> 6) & 63) | 128;
            ba[--n] = (c >> 12) | 224;
        }
    }
    ba[--n] = 0;
    const x = [];
    while (n > 2) { // random non-zero pad
        x[0] = 0;
        while (x[0] == 0) {
            rng.nextBytes(x);
        }
        ba[--n] = x[0];
    }
    ba[--n] = 2;
    ba[--n] = 0;
    return new BigInteger(ba);
}

// Undo PKCS#1 (type 2, random) padding and, if valid, return the plaintext
function pkcs1unpad2(d: BigInteger, n: number): string | undefined {
    const b = d.toByteArray();
    let i = 0;
    while (i < b.length && b[i] == 0) { ++i; }
    if (b.length - i != n - 1 || b[i] != 2) {
        return undefined;
    }
    ++i;
    while (b[i] != 0) {
        if (++i >= b.length) { return undefined; }
    }
    let ret = "";
    while (++i < b.length) {
        const c = b[i] & 255;
        if (c < 128) { // utf-8 decode
            ret += String.fromCharCode(c);
        } else if ((c > 191) && (c < 224)) {
            ret += String.fromCharCode(((c & 31) << 6) | (b[i + 1] & 63));
            ++i;
        } else {
            ret += String.fromCharCode(((c & 15) << 12) | ((b[i + 1] & 63) << 6) | (b[i + 2] & 63));
            i += 2;
        }
    }
    return ret;
}


const doPublic = (key: PublicKeyData, x: BigInteger) =>
    x.modPowInt(key.e, key.n);


const doPrivate = (key: PrivateKeyData, x: BigInteger) => {
    if (key.p === undefined || key.q === undefined) {
        return x.modPow(key.d, key.n);
    } else {
        // TODO: re-calculate any missing CRT params
        let xp = x.mod(key.p).modPow(key.dmp1, key.p);
        const xq = x.mod(key.q).modPow(key.dmq1, key.q);

        while (xp.compareTo(xq) < 0) {
            xp = xp.add(key.p);
        }
        return xp.subtract(xq).multiply(key.coeff).mod(key.p).multiply(key.q).add(xq);
    }
};


// RSAKey.prototype.setPublic = RSASetPublic;
// Set the public key fields N and e from hex strings
export const createPublicKey = (keySize: string | number, publicExponent: string): PublicKeyData => {
    if (publicExponent.length !== 0) {
        const e = parseInt(publicExponent, 16);
        if (typeof (keySize) === "string") {
            if (keySize.length > 0) {
                return { e, n: parseBigInt(keySize, 16) };
            }
        } else {
            return { e, n: new BigInteger(keySize) };
        }
    }
    throw new Error("Invalid RSA public key");
};

// RSAKey.prototype.encrypt = RSAEncrypt;
// Return the PKCS#1 RSA encryption of "text" as an even-length hex string
export const encrypt = (key: PublicKeyData, text: string): string => {
    const c = doPublic(key, pkcs1pad2(text, (key.n.bitLength() + 7) >> 3));
    const h = c.toString(16);
    return ((h.length & 1) == 0) ? h : `0${h}`;
};


// RSAKey.prototype.decrypt = RSADecrypt;
// Return the PKCS#1 RSA decryption of "ctext".
// "ctext" is an even-length hex string and the output is a plain string.
// public decrypt(ctext: string) {
export const decrypt = (key: PrivateKeyData, text: string) => {
    const m = doPrivate(key, parseBigInt(text, 16));
    return pkcs1unpad2(m, (key.n.bitLength() + 7) >> 3);
};


// public setPrivate(N: string, E: string, D: string) {
// RSAKey.prototype.setPrivateEx = RSASetPrivateEx;
// Set the private key fields N, e, d and CRT params from hex strings
//    public setPrivateEx(N: string, E: string, D: string, P: string, Q: string, DP: string, DQ: string, C: string) {
export const createPrivateKey = (n: string, e: string, d: string, p: string, q: string, dp: string, dq: string, c: string): PrivateKeyData => {
    if (n.length > 0 && e.length > 0) {
        return {
            n: parseBigInt(n, 16),
            e: parseInt(e, 16),
            d: parseBigInt(d, 16),
            p: parseBigInt(p, 16),
            q: parseBigInt(q, 16),
            dmp1: parseBigInt(dp, 16),
            dmq1: parseBigInt(dq, 16),
            coeff: parseBigInt(c, 16)
        };
    } else {
        throw new Error("Invalid RSA private key");
    }
};


// RSAKey.prototype.generate = RSAGenerate;
// Generate a new random private key B bits long, using public expt E
// public generate(B: number, E: string) {
// publicExponent = "010001"
export const generatePrivateKey = (keySize: number, publicExponent: string): PrivateKeyData => {
    const qs = keySize >> 1;
    // const e = parseInt(e_seed, 16);
    const ee = new BigInteger(publicExponent, 16);
    const rndBigInt = (a: number) => {
        for (; ;) {
            const p = new BigInteger(a, 1, rng);
            if (p.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) == 0 && p.isProbablePrime(10)) {
                return p;
            }
        }
    };
    const pq = (): [BigInteger, BigInteger] => {
        const p = rndBigInt(keySize - qs);
        const q = rndBigInt(qs);
        return (p.compareTo(q) <= 0) ? [q, p] : [p, q];
    };
    const calc = () => {
        for (; ;) {
            const [p, q] = pq();
            const p1 = p.subtract(BigInteger.ONE);
            const q1 = q.subtract(BigInteger.ONE);
            const phi = p1.multiply(q1);
            if (phi.gcd(ee).compareTo(BigInteger.ONE) == 0) {
                return { p, q, p1, q1, phi };
            }
        }
    };
    const { p, q, p1, q1, phi } = calc();
    const d = ee.modInverse(phi);
    return {
        n: p.multiply(q),
        e: parseInt(publicExponent, 16),
        d,
        p, q,
        dmp1: d.mod(p1),
        dmq1: d.mod(q1),
        coeff: q.modInverse(p)
    };
};

export const sign = (key: PrivateKeyData, text: string, digestMethod: (str: string) => string, digestName: string): string => {
    const header = getDigestHeader(digestName);
    const digest = header + digestMethod(text).toString();
    const m = pkcs1pad1(digest, key.n.bitLength() / 4);
    const c = doPrivate(key, m);
    const h = c.toString(16);
    if ((h.length & 1) == 0) {
        return h;
    } else {
        return "0" + h;
    }
};

export const verify = (key: PublicKeyData, text: string, signature: string, digestMethod: (str: string) => string): boolean => {
    const c = parseBigInt(signature, 16);
    const m = doPublic(key, c);
    const unpadded = m.toString(16).replace(/^1f+00/, "");
    const digest = removeDigestHeader(unpadded);
    return digest == digestMethod(text).toString();
};
