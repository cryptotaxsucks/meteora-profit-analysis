// pages/wallet/[walletAddress].tsx
import { useEffect, useState } from "react";
import DefaultLayout from "@/layouts/default";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { Summary } from "@/components/summary";

/* @ts-ignore - constructable worker provided by worker-loader via types/worker-loader.d.ts */
import WorkerCtor from "@/workers/download.worker";

export default function WalletPage() {
  const [downloadWorker, setDownloadWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const w = new WorkerCtor();
    setDownloadWorker(w);
    return () => {
      w.terminate();
    };
  }, []);

  if (!downloadWorker) {
    return <FullPageSpinner />;
  }

  return (
    <DefaultLayout>
      <Summary downloadWorker={downloadWorker} />
    </DefaultLayout>
  );
}
