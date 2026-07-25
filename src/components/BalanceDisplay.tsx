import { FaSync, FaCoins } from "react-icons/fa";

interface BalanceDisplayProps {
  balance: string | null;
  assets: Array<{ code: string; issuer: string; balance: string }>;
  loading: boolean;
  onRefresh: () => void;
}

export function BalanceDisplay({
  balance,
  assets,
  loading,
  onRefresh,
}: BalanceDisplayProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <FaCoins className="text-blue-400" />
          </div>
          <h3 className="text-white font-semibold">Balance</h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          title="Refresh balance"
        >
          <FaSync className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-8 bg-white/5 rounded-xl animate-pulse w-2/3" />
        </div>
      ) : (
        <>
          <div className="bg-black/20 rounded-xl px-5 py-4 mb-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              XLM Balance
            </p>
            <p className="text-white text-3xl font-bold">
              {balance
                ? parseFloat(balance).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 7,
                  })
                : "0.00"}
            </p>
          </div>

          {assets.length > 0 && (
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                Other Assets
              </p>
              <div className="space-y-2">
                {assets.map((asset, i) => (
                  <div
                    key={`${asset.code}-${asset.issuer}-${i}`}
                    className="flex items-center justify-between bg-black/10 rounded-lg px-4 py-2.5"
                  >
                    <span className="text-white text-sm font-medium">
                      {asset.code}
                    </span>
                    <span className="text-gray-300 text-sm">
                      {asset.balance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
