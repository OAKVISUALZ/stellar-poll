import { FaWallet, FaSignOutAlt, FaCopy, FaCheck } from "react-icons/fa";
import { useState } from "react";
import { shortenAddress } from "../lib/contract";

interface WalletConnectionProps {
  isConnected: boolean;
  publicKey: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  loading: boolean;
}

export function WalletConnection({
  isConnected,
  publicKey,
  onConnect,
  onDisconnect,
  loading,
}: WalletConnectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isConnected && publicKey) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <FaWallet className="text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Wallet Connected</h3>
            <p className="text-gray-400 text-sm">Stellar Testnet</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black/20 rounded-xl px-4 py-3 mb-4">
          <code className="text-purple-300 text-sm font-mono flex-1 truncate">
            {shortenAddress(publicKey)}
          </code>
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors"
            title="Copy address"
          >
            {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
          </button>
        </div>
        <button
          onClick={onDisconnect}
          className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium py-2.5 px-4 rounded-xl transition-colors"
        >
          <FaSignOutAlt />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
          <FaWallet className="text-purple-400 text-2xl" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-400 text-sm">
          Connect your Stellar wallet to start voting on polls
        </p>
      </div>
      <button
        onClick={onConnect}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-purple-500/25"
      >
        {loading ? (
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
            Connecting...
          </span>
        ) : (
          "Connect Wallet"
        )}
      </button>
    </div>
  );
}
