import { useState } from "react";
import { FaFileContract, FaRocket, FaTrash } from "react-icons/fa";
import { deployContract, initializeContract } from "../lib/contract";

interface ContractSetupProps {
  publicKey: string;
  contractId: string | null;
  onDeployed: (contractId: string) => void;
  onClear: () => void;
  onStatus: (status: {
    type: "pending" | "success" | "error";
    message: string;
    hash?: string;
  } | null) => void;
}

export function ContractSetup({
  publicKey,
  contractId,
  onDeployed,
  onClear,
  onStatus,
}: ContractSetupProps) {
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = async () => {
    setDeploying(true);
    onStatus({ type: "pending", message: "Uploading contract WASM to testnet..." });

    try {
      const { contractId: newId, hash: deployHash } = await deployContract(publicKey);
      onStatus({
        type: "pending",
        message: `Contract deployed! Initializing... (${newId.slice(0, 12)}...)`,
        hash: deployHash,
      });

      try {
        await initializeContract(newId, publicKey);
      } catch {
        // initialize might already be called or not needed
      }

      onDeployed(newId);
      onStatus({
        type: "success",
        message: `Contract deployed and ready! Address: ${newId.slice(0, 16)}...`,
        hash: deployHash,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("rejected") || msg.includes("denied")) {
        onStatus({
          type: "error",
          message: "Deployment rejected by wallet. Please approve the transaction.",
        });
      } else if (msg.includes("insufficient") || msg.includes("low balance")) {
        onStatus({
          type: "error",
          message: "Insufficient XLM balance to deploy contract. Get testnet XLM from the faucet.",
        });
      } else {
        onStatus({
          type: "error",
          message: `Deployment failed: ${msg}`,
        });
      }
    } finally {
      setDeploying(false);
    }
  };

  const handleClear = () => {
    onClear();
    onStatus(null);
  };

  if (contractId) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <FaFileContract className="text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Contract Deployed</h3>
            <p className="text-gray-400 text-xs">Live Poll Contract on Testnet</p>
          </div>
        </div>
        <div className="bg-black/20 rounded-xl px-4 py-3 mb-3">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
            Contract Address
          </p>
          <code className="text-purple-300 text-xs font-mono break-all">
            {contractId}
          </code>
        </div>
        <div className="flex gap-2">
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${contractId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-blue-400 hover:text-blue-300 text-xs py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
          >
            View on Explorer
          </a>
          <button
            onClick={handleClear}
            className="flex items-center justify-center gap-1 text-red-400 hover:text-red-300 text-xs py-2 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <FaTrash size={10} /> Reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
          <FaRocket className="text-orange-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Deploy Poll Contract</h3>
          <p className="text-gray-400 text-sm">
            Deploy a Live Poll contract to Stellar Testnet
          </p>
        </div>
      </div>
      <button
        onClick={handleDeploy}
        disabled={deploying}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-orange-500/25"
      >
        {deploying ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Deploying Contract...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <FaRocket />
            Deploy Contract
          </span>
        )}
      </button>
    </div>
  );
}
