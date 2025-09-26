// pages/wallet/[walletAddress].tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import DefaultLayout from "@/layouts/default";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { Summary } from "@/components/summary";

/* @ts-ignore - provided by types/worker-loader.d.ts */
import DownloadWorker from "@/workers/download.worker.ts";

export default function WalletPage() {
  const _router = useRouter();
  const [downloadWorker, setDownloadWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const w = new DownloadWorker();
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
