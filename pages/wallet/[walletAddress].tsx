// pages/wallet/[walletAddress].tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// UI + app bits
import DefaultLayout from "@/layouts/default";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { Summary } from "@/components/summary";

// IMPORTANT: use the bundled worker import (no /public, no new URL(...))
/* @ts-ignore - handled by types/worker-loader.d.ts */
import DownloadWorker from "@/workers/download.worker.ts";

export default function WalletPage() {
  // (Router is kept in case Summary relies on the dynamic route internally)
  const _router = useRouter();

  // Hold the worker instance in state so React re-renders once it's ready
  const [downloadWorker, setDownloadWorker] = useState<Worker | null>(null);

  useEffect(() => {
    // Create the worker once on mount
    const w = new DownloadWorker();
    setDownloadWorker(w);

    // Optional: listen for a 'ready' handshake if your worker posts it
    // const onMessage = (e: MessageEvent) => {
    //   if (e.data === "ready") { /* stop any local loading states if needed */ }
    // };
    // w.addEventListener("message", onMessage);

    // Cleanup on unmount
    return () => {
      // w.removeEventListener("message", onMessage);
      w.terminate();
    };
  }, []);

  // Until the worker is created, show the spinner
  if (!downloadWorker) {
    return <FullPageSpinner />;
  }

  return (
    <DefaultLayout>
      <Summary downloadWorker={downloadWorker} />
    </DefaultLayout>
  );
}
