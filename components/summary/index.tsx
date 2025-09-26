// components/summary/index.tsx
import { MeteoraDlmmDbTransactions } from "@geeklad/meteora-dlmm-db/dist/meteora-dlmm-db";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { MeteoraDlmmDownloaderStats } from "@geeklad/meteora-dlmm-db/dist/meteora-dlmm-downloader";

import { FullPageSpinner } from "../full-page-spinner";

import { QuoteTokenDisplay } from "@/components/summary/quote-token-display";
import { Filter } from "@/components/summary/filter";
import {
  generateSummary,
  TransactionFilter,
  applyFilter,
  SummaryData,
} from "@/components/summary/generate-summary";
import { SummaryTop } from "@/components/summary/top";

// Local, flexible type for worker messages (avoids TS errors on 'stats')
type WorkerMessage = {
  stats?: Partial<MeteoraDlmmDownloaderStats> & {
    downloadingComplete?: boolean;
  };
  transactions?: MeteoraDlmmDbTransactions[];
} | string;

export const Summary = (props: { downloadWorker: Worker }) => {
  const router = useRouter();

  const [stats, setStats] = useState<MeteoraDlmmDownloaderStats>({
    downloadingComplete: false,
    positionsComplete: false,
    transactionDownloadCancelled: false,
    fullyCancelled: false,
    secondsElapsed: 0,
    accountSignatureCount: 0,
    oldestTransactionDate: new Date(),
    positionTransactionCount: 0,
    positionCount: 0,
    usdPositionCount: 0,
    missingUsd: 0,
  });
  const [allTransactions, setAllTransactions] = useState<
    MeteoraDlmmDbTransactions[]
  >([]);
  const [summary, setSummary] = useState<SummaryData>(generateSummary([]));
  const [filteredSummary, setFilteredSummary] = useState<SummaryData>(
    generateSummary([]),
  );
  const start = useMemo(() => Date.now(), [router.query.walletAddress]);
  const [initialized, setInitialized] = useState(false);
  const [duration, setDuration] = useState(0);
  const [done, setDone] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [filter, setFilter] = useState<TransactionFilter | undefined>(
    undefined,
  );
  const [quoteTokenDisplay, setQuoteTokenDisplay] = useState<JSX.Element[]>([]);

  const getDefaultFilter = useCallback(
    (
      transactions: MeteoraDlmmDbTransactions[] = allTransactions,
    ): TransactionFilter => {
      return {
        startDate:
          transactions.length > 0
            ? new Date(
                Math.min(...transactions.map((tx) => tx.block_time * 1000)),
              )
            : new Date("11/06/2023"),
        endDate:
          transactions.length > 0
            ? new Date(
                Math.max(...transactions.map((tx) => tx.block_time * 1000)),
              )
            : new Date(Date.now() + 1000 * 60 * 60 * 24),
        positionStatus: "all",
        hawksight: "include",
        baseTokenMints: new Set(transactions.map((tx) => tx.base_mint)),
        quoteTokenMints: new Set(transactions.map((tx) => tx.quote_mint)),
        displayUsd: false,
      };
    },
    [allTransactions],
  );

  const updateQuoteTokenDisplay = useCallback(
    (sum: SummaryData, displayUsd: boolean) => {
      setQuoteTokenDisplay(
        Array.from(sum.quote.values()).map((s) => (
          <QuoteTokenDisplay
            key={s.token.mint}
            displayUsd={displayUsd}
            summary={s}
          />
        )),
      );
    },
    [],
  );

  const filterTransactions = useCallback(
    (
      transactions: MeteoraDlmmDbTransactions[],
      updatedFilter?: TransactionFilter,
      reset = false,
    ) => {
      setFilter((prevFilter) => {
        const newFilter = !reset
          ? {
              ...(prevFilter || getDefaultFilter(transactions)),
              ...updatedFilter,
            }
          : getDefaultFilter();

        const filteredTx = applyFilter(transactions, newFilter);
        const filteredSum = generateSummary(filteredTx);

        setFilteredSummary(filteredSum);
        updateQuoteTokenDisplay(filteredSum, newFilter.displayUsd);

        return updatedFilter;
      });
    },
    [getDefaultFilter, updateQuoteTokenDisplay],
  );

  const cancel = useCallback(() => {
    props.downloadWorker.postMessage("cancel");
    setCancelled(true);
  }, [props.downloadWorker]);

  const resetFilters = useCallback(() => {
    filterTransactions(allTransactions, undefined, true);
  }, [allTransactions, filterTransactions]);

  function resetDatabase() {
    props.downloadWorker.postMessage("reset");
  }

  const update = useCallback(
    (event: MessageEvent<WorkerMessage>) => {
      // Handle string control messages
      if (typeof event.data === "string") {
        if (event.data === "reset") {
          window.location.reload();
          return;
        }
        // Unexpected string – ignore safely
        return;
      }

      const data = event.data || {};
      const downloadingComplete = !!data.stats?.downloadingComplete;
      if (downloadingComplete) setDone(true);

      const txs = data.transactions ?? [];

      // Update stats if provided
      if (data.stats) {
        setStats((prev) => ({
          ...prev,
          ...data.stats,
          // Ensure required fields aren't accidentally undefined
          downloadingComplete:
            data.stats.downloadingComplete ?? prev.downloadingComplete,
        }));
      }

      if (txs.length > 0) {
        const sum = generateSummary(txs);
        setSummary(sum);
        setAllTransactions(txs);

        if (!initialized) setInitialized(true);

        // Re-apply current (or default) filters to new txs
        filterTransactions(txs, filter);
      }
    },
    [filterTransactions, initialized, filter],
  );

  useEffect(() => {
    if (router.query.walletAddress) {
      // Attach message handler
      props.downloadWorker.onmessage = update;

      // Track elapsed time
      const durationHandle = setInterval(() => {
        setDuration(Date.now() - start);
      }, 1000);

      return () => {
        clearInterval(durationHandle);
      };
    }
  }, [router.query.walletAddress, props.downloadWorker, start, update]);

  if (!initialized) {
    return <FullPageSpinner excludeLayout={true} />;
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="w-full">
        <div className="md:grid grid-flow-cols grid-cols-2 items-start">
          <SummaryTop
            cancel={cancel}
            cancelled={cancelled}
            data={filteredSummary}
            done={done}
            duration={duration}
            stats={stats}
          />
          <Filter
            allTransactions={allTransactions}
            data={summary}
            done={done}
            filter={filter || getDefaultFilter()}
            filterTransactions={(newFilter) =>
              filterTransactions(allTransactions, newFilter)
            }
            resetDatabase={resetDatabase}
            resetFilters={resetFilters}
          />
        </div>
        {quoteTokenDisplay}
        <div>&nbsp;</div>
      </div>
    </section>
  );
};
