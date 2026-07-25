import { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createPollOnChain } from "../lib/contract";

interface PollCreatorProps {
  contractId: string;
  publicKey: string;
  onPollCreated: () => void;
  onStatus: (status: {
    type: "pending" | "success" | "error";
    message: string;
    hash?: string;
  } | null) => void;
}

export function PollCreator({
  contractId,
  publicKey,
  onPollCreated,
  onStatus,
}: PollCreatorProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [creating, setCreating] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filledOptions = options.filter((o) => o.trim() !== "");
    if (!question.trim()) {
      onStatus({ type: "error", message: "Please enter a question" });
      return;
    }
    if (filledOptions.length < 2) {
      onStatus({
        type: "error",
        message: "Please provide at least 2 options",
      });
      return;
    }

    setCreating(true);
    onStatus({ type: "pending", message: "Creating poll on-chain..." });

    try {
      const { hash, pollId } = await createPollOnChain(
        contractId,
        publicKey,
        question.trim(),
        filledOptions.map((o) => o.trim())
      );
      onStatus({
        type: "success",
        message: `Poll #${pollId} created successfully!`,
        hash,
      });
      setQuestion("");
      setOptions(["", ""]);
      onPollCreated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("rejected") || msg.includes("denied")) {
        onStatus({
          type: "error",
          message: "Transaction rejected by wallet.",
        });
      } else if (msg.includes("insufficient")) {
        onStatus({
          type: "error",
          message: "Insufficient balance for transaction fee.",
        });
      } else {
        onStatus({
          type: "error",
          message: `Failed to create poll: ${msg}`,
        });
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
          <FaPlus className="text-purple-400" />
        </div>
        <h3 className="text-white font-semibold">Create New Poll</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">
            Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What do you want to ask?"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">
            Options
          </label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="text-red-400 hover:text-red-300 px-2 transition-colors"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 text-purple-400 hover:text-purple-300 text-xs transition-colors"
            >
              + Add option
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-purple-500/25"
        >
          {creating ? (
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
              Creating Poll...
            </span>
          ) : (
            "Create Poll"
          )}
        </button>
      </form>
    </div>
  );
}
