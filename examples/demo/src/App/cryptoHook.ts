import { useState, useEffect } from "react";
import { initCrypto, Crypto } from "./rsaLibAppHelpers";

export const useCrypto = (keyProvider: () => Promise<string>): Crypto | undefined => {
    const [key, setKey] = useState<string | undefined>();
    useEffect(() => {
        if (key === undefined) {
            let cancel = false;
            keyProvider()
                .then(newKey => {
                    if (!cancel) {
                        setKey(newKey);
                    }
                });
            return () => { cancel = true; };
        } else {
            return () => { };
        }
    }, [key, keyProvider]);
    // console.log({key});
    return key === undefined ? undefined : initCrypto(key);
};
