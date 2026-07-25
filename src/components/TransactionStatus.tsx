import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExternalLinkAlt,
} from "react-icons/fa";

interface TransactionStatusProps {
  status: {
    type: "pending" | "success" | "error";
    message: string;
    hash?: string;
  } | null;
  onDismiss: () => void;
}

export function TransactionStatus({ status, onDismiss }: TransactionStatusProps) {
  if (!status) return null;

  const colors = {
    pending: {
      bg: "bg-yellow-500/10 border-yellow-500/30",
      icon: "text-yellow-400",
      title: "text-yellow-300",
    },
    success: {
      bg: "bg-green-500/10 border-green-500/30",
      icon: "text-green-400",
      title: "text-green-300",
    },
    error: {
      bg: "bg-red-500/10 border-red-500/30",
      icon: "text-red-400",
      title: "text-red-300",
    },
  };

  const c = colors[status.type];

  return (
    <div
      className={`backdrop-blur-lg rounded-2xl p-5 shadow-2xl border ${c.bg}`}
    >
      <div className="flex items-start gap-3">
        {status.type === "pending" && (
          <FaSpinner className={`${c.icon} text-xl mt-0.5 shrink-0 animate-spin`} />
        )}
        {status.type === "success" && (
          <FaCheckCircle className={`${c.icon} text-xl mt-0.5 shrink-0`} />
        )}
        {status.type === "error" && (
          <FaTimesCircle className={`${c.icon} text-xl mt-0.5 shrink-0`} />
        )}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold mb-1 ${c.title}`}>
            {status.type === "pending"
              ? "Processing..."
              : status.type === "success"
                ? "Success!"
                : "Error"}
          </h4>
          <p className="text-gray-300 text-sm mb-2">{status.message}</p>
          {status.hash && (
            <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2">
              <span className="text-gray-400 text-xs">Hash:</span>
              <code className="text-purple-300 text-xs font-mono truncate flex-1">
                {status.hash}
              </code>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${status.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 shrink-0"
                title="View on Stellar Explorer"
              >
                <FaExternalLinkAlt />
              </a>
            </div>
          )}
        </div>
        {status.type !== "pending" && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-white transition-colors text-sm shrink-0"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
