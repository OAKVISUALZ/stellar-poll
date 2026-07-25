import { useState, useEffect, useCallback } from "react";
import { FaPoll } from "react-icons/fa";
import { WalletConnection } from "./components/WalletConnection";
import { BalanceDisplay } from "./components/BalanceDisplay";
import { PollCreator } from "./components/PollCreator";
import { PollList } from "./components/PollList";
import { ContractSetup } from "./components/ContractSetup";
import { TransactionStatus } from "./components/TransactionStatus";
import {
  initKit,
  connectWallet,
  disconnectWallet,
  getAddress,
  getBalance,
} from "./lib/stellar";
import { getStoredContractId, clearContractId } from "./lib/contract";

interface TxStatus {
  type: "pending" | "success" | "error";
  message: string;
  hash?: string;
}

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [assets, setAssets] = useState<
    Array<{ code: string; issuer: string; balance: string }>
  >([]);
  const [connecting, setConnecting] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [contractId, setContractId] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    initKit();
    setContractId(getStoredContractId());
  }, []);

  const fetchBalance = useCallback(async (address: string) => {
    setBalanceLoading(true);
    try {
      const result = await getBalance(address);
      setBalance(result.xlm);
      setAssets(result.assets);
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  const checkExistingConnection = useCallback(async () => {
    const address = await getAddress();
    if (address) {
      setPublicKey(address);
      setIsConnected(true);
      fetchBalance(address);
    }
  }, [fetchBalance]);

  useEffect(() => {
    checkExistingConnection();
  }, [checkExistingConnection]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const address = await connectWallet();
      setPublicKey(address);
      setIsConnected(true);
      await fetchBalance(address);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("not found") || msg.includes("not installed")) {
        setTxStatus({
          type: "error",
          message:
            "Wallet not found. Please install Freighter or another Stellar wallet extension.",
        });
      } else if (msg.includes("rejected") || msg.includes("denied")) {
        setTxStatus({
          type: "error",
          message: "Connection rejected by the wallet. Please approve the request.",
        });
      } else {
        setTxStatus({
          type: "error",
          message: `Connection failed: ${msg}`,
        });
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch {
      // proceed with local disconnect
    }
    setIsConnected(false);
    setPublicKey(null);
    setBalance(null);
    setAssets([]);
  };

  const handleRefreshBalance = () => {
    if (publicKey) fetchBalance(publicKey);
  };

  const handleContractDeployed = (id: string) => {
    setContractId(id);
  };

  const handlePollCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleClearContract = () => {
    clearContractId();
    setContractId(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-3">
          <FaPoll className="text-purple-400 text-2xl" />
          <h1 className="text-white text-2xl font-bold">
            Stellar<span className="text-purple-400">Poll</span>
          </h1>
        </div>
        <p className="text-gray-400 text-center text-sm mt-1">
          Real-time Voting on Stellar Testnet
        </p>
      </header>

      <main className="flex-1 px-4 pb-12">
        <div className="max-w-md mx-auto space-y-5">
          <WalletConnection
            isConnected={isConnected}
            publicKey={publicKey}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            loading={connecting}
          />

          {isConnected && publicKey && (
            <>
              <BalanceDisplay
                balance={balance}
                assets={assets}
                loading={balanceLoading}
                onRefresh={handleRefreshBalance}
              />

              <ContractSetup
                publicKey={publicKey}
                contractId={contractId}
                onDeployed={handleContractDeployed}
                onClear={handleClearContract}
                onStatus={setTxStatus}
              />

              {contractId && (
                <>
                  <PollCreator
                    contractId={contractId}
                    publicKey={publicKey}
                    onPollCreated={handlePollCreated}
                    onStatus={setTxStatus}
                  />

                  <PollList
                    contractId={contractId}
                    publicKey={publicKey}
                    refreshTrigger={refreshTrigger}
                    onStatus={setTxStatus}
                  />
                </>
              )}
            </>
          )}

          <TransactionStatus
            status={txStatus}
            onDismiss={() => setTxStatus(null)}
          />
        </div>
      </main>

      <footer className="py-4 text-center text-gray-500 text-xs">
        Built for Stellar Journey to Mastery - Level 2 Yellow Belt
      </footer>
    </div>
  );
}

export default App;
