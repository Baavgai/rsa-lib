import { generateKey } from "rsa-lib";
import { securePost, SecureMessage } from "./rsaLibAppHelpers";

export interface ApiService {
    readonly serverUrl?: string;
    getServerKey: () => Promise<string>;
    sendMessage: (message: SecureMessage) => Promise<string>;
}

export const getApiService = (): ApiService => {
    const url = process.env["REACT_APP_SERVER_URL"];
    if (url === "simulation") {
        const key = generateKey(128);
        return {
            getServerKey: () => Promise.resolve(key.getPublicKey()),
            sendMessage: x => Promise.resolve(key.decrypt(x.message) ?? "")
        };
    } else {
        const serverUrl = url ?? "api";
        return {
            serverUrl,
            getServerKey: () =>
                fetch(`${serverUrl}/key`)
                    .then(x => x.json())
                    .then(x => { console.log(x); return x; })
                    .then(x => x.publicKey),
            sendMessage: x => securePost(`${serverUrl}/secret`, x)
        };
    }
};
