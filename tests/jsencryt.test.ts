import { TestKey, TEST_KEYS } from "./testkeys";

// import { createKey, generateKey, isPrivate } from "..";
import { createKey, generateKey, isPrivate } from "../dist";
// import * as lib from "..";

const testBase64 = (pkey: string) => {
    it("should not contain public header and footer,one line, base64 encoded", function () {
        //regex to match base64 encoded string, reference:
        //http://stackoverflow.com/a/5885097/1446321
        const regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
        expect(pkey).toMatch(regex);
    });
};


const testPrivKey = (keyStr: string) =>
    describe("test private key", () => {
        const key = createKey(keyStr);
        it("should be private key", () => expect(key.publicOnly).toEqual(false));
        if (isPrivate(key)) {
            it("should both encrypt and decrypt", () => {
                const test = "test";
                const enc = key.encrypt(test);
                const dec = key.decrypt(enc);
                expect(dec).toEqual(test);
            });
        }
    });

const testPubKey = (keyStr: string) =>
    describe("test public key", () => {
        const key = createKey(keyStr);
        it("should be public key", () => expect(key.publicOnly).toEqual(true));
        it("should only encrypt", () => {
            const test = "test";
            key.encrypt(test);
        });
    });

const testFormats = (keySize: number) => {
    const key = generateKey(keySize);

    describe("#getPublicKey(\"wrapped\")", function () {
        it("should contain public header and footer and be wrapped at 64 chars", function () {
            //For small bit keys, the public key may contain only one line
            const regex = /-----BEGIN PUBLIC KEY-----\n((.{64}\n)+(.{1,64}\n)?)|(.{1,64}\n)-----END PUBLIC KEY-----/;
            expect(key.getPublicKey("wrapped")).toMatch(regex);

        });
    });
    describe("#getPrivateKey(\"wrapped\")", function () {
        it("should contain private header and footer and be wrapped at 64 chars", function () {
            const regex = /-----BEGIN RSA PRIVATE KEY-----\n(.{64}\n)+(.{1,64}\n)?-----END RSA PRIVATE KEY-----/;
            expect(key.getPrivateKey("wrapped")).toMatch(regex);
        });
    });

    describe("#getPublicKey(\"base64\")", () => testBase64(key.getPublicKey("base64")));
    describe("#getPrivateKey(\"base64\")", () => testBase64(key.getPrivateKey("base64")));
};

const testInstance = (keySize: number) => {
    const key = generateKey(keySize);
    describe("test key size", function () {
        it(`should be ${keySize} bit long`, () => {

            expect(key.bitLength % 2 === 0 ? key.bitLength : key.bitLength + 1).toEqual(keySize);
        });
    });

    describe("#encrypt() | #decrypt()", function () {
        //Tom Wu's RSA Object use paddingpkcs #1, type 2
        const maxLength = (((key.bitLength + 7) >> 3) - 11);
        const maxLengthBit = maxLength << 3;

        it("should encrypt/decrypt up to " + maxLengthBit + " bit", () => {
            const test = "a".repeat(maxLength);
            const encrypted = key.encrypt(test);
            expect(encrypted).not.toEqual(false);
            const decrypted = key.decrypt(encrypted);
            expect(decrypted).toEqual(test);
        });


        it("should fail to encrypt more than " + maxLengthBit + " bit", () => {
            const test = "a".repeat(maxLength + 1);
            expect(() => key.encrypt(test)).toThrow("Message too long for RSA");
        });

    });


    describe("#sign() | #verify()", () => {
        const maxLength = (((key.bitLength + 7) >> 3) - 11);
        const maxLengthBit = maxLength << 3;

        it("should sign/verify up to " + maxLengthBit + " bit", function () {
            const test = "a".repeat(maxLength);
            const signature = key.sign(test);
            const verified = key.verify(test, signature);
            expect(verified).toEqual(true);
            const failed = key.verify("no", signature);
            expect(failed).toEqual(false);
        });

        /*
        it('should fail to verify more than ' + maxLengthBit + ' bit', function () {
            const test = 'a'.repeat(maxLength + 1);
            expect(() => key.sign(test)).toThrow("Message too long for RSA");
        });
*/
    });


};

const keyTest = (tk: TestKey) => {
    describe("JSEncrypt - " + tk.keySize + " bit", function () {
        testFormats(tk.keySize);
        testInstance(tk.keySize);
        testPrivKey(tk.privateKey);
        testPubKey(tk.publicKey);
    });
};

// keyTest(TEST_KEYS[0]);
// jest.setTimeout(30000);
TEST_KEYS.forEach(keyTest);

/*
declare let global: any;

global.window = { navigator: 2 };
global.navigator = 1;

import { TEST_KEYS } from "./testkeys";

import * as lib from "../jsencrypt-tester-lib";

const tk = TEST_KEYS[1];
console.log(tk);

const jse = new lib.JSEncrypt({});
jse.setPrivateKey(tk.privateKey);
const test = "test";
const enc = jse.encrypt(test);
const dec = enc === false ? 'fail' : jse.decrypt(enc);
console.log({test, enc, dec});


const tmp = new lib.JSEncrypt({});
tmp.setPublicKey(tk.publicKey);
const test = "test";
const enc = tmp.encrypt(test);

console.log(enc);
const nonEmptyCheck = (pkey: string) => {
    it("should be a non-empty string", function () {
        expect(typeof (pkey)).toEqual("string");
        expect(pkey.length).not.toEqual(0);
    });
};

*/