import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

import { Summary } from "@/components/summary";
import { AppState } from "@/pages/_app";
import DefaultLayout from "@/layouts/default";
import { FullPageSpinner } from "@/components/full-page-spinner";
import DownloadWorker from '@/workers/download.worker.ts';

export default function IndexPage() {
  const appState = useContext(AppState);
  const router = useRouter();

  const [downloadWorker, setDownloadWorker] = useState<Worker>();

  useEffect(() => {
  const w = new DownloadWorker();
  setDownloadWorker(w);
  return () => w.terminate();
}, []);

  // @ts-ignore
import DataWorker from "@/workers/data.worker.ts";

...

const dbWorker = new DataWorker();


      worker.postMessage({
        rpc: appState.rpc,
        walletAddress,
      });
      setDownloadWorker(worker);
    }
  }

  if (!downloadWorker) {
    return <FullPageSpinner />;
  }

  return (
    <DefaultLayout>
      <Summary downloadWorker={downloadWorker} />
    </DefaultLayout>
  );
}
