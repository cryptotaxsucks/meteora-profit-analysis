// pages/wallet/[walletAddress].tsx
import { useEffect, useState } from "react";
import DefaultLayout from "@/layouts/default";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { Summary } from "@/components/summary";

/**
 * IMPORTANT:
 * - Import WITHOUT the ".ts" extension so it matches the *.worker declaration.
 * - Then cast to a constructable type to satisfy TS in all environments.
 */
/* @ts-ignore - provided by types/worker-loader.d.ts */
import WorkerModule from "@/workers/download.worker";

type WorkerConstructor = new () => Worker;
const WorkerCtor = WorkerModule as unknown as WorkerConstructor;

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
