import React, { useState } from "react";
import { Layout } from "./Layout";
import { AppProps, AppState } from "./types";
import { getApiService } from "./service";
import { useCrypto } from "./cryptoHook";

const api = getApiService();

const INIT_STATE: Omit<AppState, "serverKey"> = {
    message: "",
    messageSent: "",
    messageSentEnc: "",
    messageServerDecode: ""
};

const useAppProps = (): AppProps => {
    const crypto = useCrypto(api.getServerKey);
    const [state, setState] = useState(INIT_STATE);
    return {
        ...state,
        serverKey: crypto?.publicKey ?? "",
        updateMessage: (message: string) => setState(s => ({ ...s, message })),
        sendMessage: () => {
            if (crypto) {
                const { message } = state;
                crypto.encrypt(message)
                    .then(sm => {
                        api.sendMessage(sm).then(x => setState(s => ({ ...s, messageServerDecode: x, message: "" })));
                        setState(s => ({ ...s, messageSent: message, messageSentEnc: sm.message }));
                    });
            }
        }
    };
};

export const App = () => {
    const p = useAppProps();
    console.log({api, p});
    return <Layout {...p} />;
};

// "jsencrypt": "file:./../../jsencrypt",
