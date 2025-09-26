import type { AppProps } from "next/app";

import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Dispatch, SetStateAction, createContext, useState } from "react";
import { useRouter } from "next/router";
import { Connection } from "@solana/web3.js";

import { fontSans, fontMono } from "@/config/fonts";
import "@/styles/globals.css";

// pages/_app.tsx
const RPC_URL: string = process.env.NEXT_PUBLIC_SOLANA_RPC || "";

let connection: Connection | undefined;
try {
  if (!RPC_URL) {
    // Optional: remove these console lines if you want a silent build.
    // eslint-disable-next-line no-console
    console.warn("NEXT_PUBLIC_SOLANA_RPC is not set; RPC-dependent features may not work.");
  } else {
    connection = new Connection(RPC_URL, "confirmed");
    // eslint-disable-next-line no-console
    console.log("Solana Connection initialized successfully");
  }
} catch (error) {
  // eslint-disable-next-line no-console
  console.error("Failed to initialize Solana Connection:", error);
}

export default function MyApp({ Component, pageProps }: AppProps) {
  // If you later want to provide `connection` via context, you can do it here.
  return <Component {...pageProps} />;
}
  const router = useRouter();
  const [rpc, setRpc] = useState(RPC_URL);
  const [connection, setConnection] = useState(
    new Connection(RPC_URL) as Connection | undefined,
  );
  const [verifyingRpc, setVerifyingRpc] = useState(true);
  const [transactionCount, setTransactionCount] = useState(0);

  async function checkRpc(rpc: string) {
    if (rpc.match(/^https:\/\//)) {
      try {
        const connection = new Connection(rpc);

        await connection.getLatestBlockhash();

        setConnection(connection);
      } catch (err) {
        setConnection(undefined);
      }
    } else {
      setConnection(undefined);
    }
    setVerifyingRpc(false);
  }

  function updateRpc(newRpc: string) {
    setRpc(newRpc);
    setVerifyingRpc(true);
    setConnection(undefined);
    checkRpc(newRpc);
  }

  return (
    <AppState.Provider
      value={{
        rpc,
        connection,
        verifyingRpc,
        updateRpc,
        transactionCount,
        setTransactionCount,
      }}
    >
      <NextUIProvider navigate={router.push}>
        <NextThemesProvider defaultTheme="dark">
          <Component {...pageProps} />
        </NextThemesProvider>
      </NextUIProvider>
    </AppState.Provider>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};
