export interface AppState  {
    message: string;
    messageSent: string;
    messageSentEnc: string;
    messageServerDecode: string;
    serverKey: string;
}

export interface AppController {
    updateMessage: (message: string) => void;
    sendMessage: () => void;
}

export type AppProps = AppState & AppController;
