// pages/_app.tsx
import type { AppProps } from "next/app";
import React, { createContext, useMemo, useState } from "react";
import { Connection } from "@solana/web3.js";

// If you have global styles, you can import them here:
// import "@/styles/globals.css";

export interface AppStateInterface {
  rpc: string;
  connection?: Connection;
  updateRpc: (rpc: string) => void;
}

export const AppState = createContext<AppStateInterface>({
  rpc: "",
  connection: undefined,
  updateRpc: () => {},
});

export default function MyApp({ Component, pageProps }: AppProps) {
  // Read client-exposed env; keep empty string if not set
  const initialRpc = (process.env.NEXT_PUBLIC_SOLANA_RPC as string) || "";
  const [rpc, setRpc] = useState<string>(initialRpc);

  // Only create a Connection when rpc is a non-empty string
  const connection = useMemo(() => {
    if (!rpc) return undefined;
    try {
      return new Connection(rpc, "confirmed");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to create Solana Connection:", err);
      return undefined;
    }
  }, [rpc]);

  const updateRpc = (newRpc: string) => setRpc(newRpc);

  return (
    <AppState.Provider value={{ rpc, connection, updateRpc }}>
      <Component {...pageProps} />
    </AppState.Provider>
  );
}
