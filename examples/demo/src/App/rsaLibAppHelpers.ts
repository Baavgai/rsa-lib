import { createKey } from "rsa-lib";

export interface SecureMessage {
    message: string;
}

export type Encrypt = (msg: any) => Promise<SecureMessage>;

export interface Crypto {
    readonly publicKey: string;
    valid: boolean;
    encrypt: Encrypt;
}


export const initCrypto = (publicKey: string): Crypto => {
    const key = createKey(publicKey);
    if (key === undefined) {
        return {
            publicKey,
            valid: false,
            encrypt: msg => new Promise<SecureMessage>((resolve, reject) => reject("invalid encryption key"))
        };
    } else {
        return {
            publicKey,
            valid: true,
            encrypt: msg => new Promise<SecureMessage>((resolve, reject) => {
                if (!msg) {
                    reject("empty message");
                } else {
                    try {
                        const message = key.encrypt((typeof msg === "string") ? msg : JSON.stringify(msg));
                        resolve({ message });
                    } catch {
                        reject("encryption failure");
                    }
                }
            })
        };
    }
};

export const dataEncrypt = (encrypt: Encrypt, data: any) =>
    (typeof data === "string") ? encrypt(data) : encrypt(JSON.stringify(data));

export const securePost = <T = any>(url: string, secureMessage: SecureMessage, fromJson?: (x: any) => T) =>
    fetch(url, {
        method: "post",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(secureMessage)
    })
        .then(x => x.json())
        .then(x => fromJson ? fromJson(x) : (x as T));

export const secureEncPost = <T = any>(encrypt: Encrypt, url: string, data: any, fromJson?: (x: any) => T) =>
    dataEncrypt(encrypt, data).then(sm => securePost(url, sm, fromJson));

/*
export function securePost<T = any>(url: string, encrypt: Encrypt, data: any, fromJson?: (x: any) => T): T;
export function securePost<T = any>(url: string, secureMessage: SecureMessage, fromJson?: (x: any) => T): T;
export function securePost<T = any>(url: string, smOrEnc: SecureMessage | Encrypt, fromJson?: (x: any) => T): T {

}
export const securePost = <T = any>(encrypt: Encrypt, url: string, data: any, fromJson?: (x: any) => T) =>
    dataEncrypt(encrypt, data)
        .then(sm => fetch(url, {
            method: "post",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(sm)
        }))
        .then(x => x.json())
        .then(x => fromJson ? fromJson(x) : (x as T));
*/