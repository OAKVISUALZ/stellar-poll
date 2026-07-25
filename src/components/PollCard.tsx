import { useState } from "react";
import { FaCheck, FaLock } from "react-icons/fa";
import { voteOnPoll, closePollOnChain } from "../lib/contract";

interface PollCardProps {
  poll: {
    id: number;
    question: string;
    options: string[];
    votes: number[];
    creator: string;
    totalVotes: number;
    active: boolean;
    userVoted: boolean;
  };
  contractId: string;
  publicKey: string;
  onVoted: () => void;
  onStatus: (status: {
    type: "pending" | "success" | "error";
    message: string;
    hash?: string;
  } | null) => void;
}

export function PollCard({
  poll,
  contractId,
  publicKey,
  onVoted,
  onStatus,
}: PollCardProps) {
  const [votingIndex, setVotingIndex] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [localVotes, setLocalVotes] = useState<number[] | null>(null);

  const displayVotes = localVotes ?? poll.votes;

  const handleVote = async (optionIndex: number) => {
    setVotingIndex(optionIndex);
    onStatus({ type: "pending", message: "Submitting your vote..." });

    try {
      const { hash } = await voteOnPoll(
        contractId,
        publicKey,
        poll.id,
        optionIndex
      );
      onStatus({
        type: "success",
        message: `Vote recorded for "${poll.options[optionIndex]}"!`,
        hash,
      });
      setLocalVotes(
        displayVotes.map((v, i) => (i === optionIndex ? v + 1 : v))
      );
      onVoted();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already voted")) {
        onStatus({
          type: "error",
          message: "You have already voted on this poll.",
        });
      } else if (msg.includes("rejected")) {
        onStatus({
          type: "error",
          message: "Vote rejected by wallet.",
        });
      } else {
        onStatus({
          type: "error",
          message: `Vote failed: ${msg}`,
        });
      }
    } finally {
      setVotingIndex(null);
    }
  };

  const handleClose = async () => {
    setClosing(true);
    try {
      await closePollOnChain(contractId, publicKey, poll.id);
      onStatus({
        type: "success",
        message: `Poll #${poll.id} has been closed.`,
      });
      onVoted();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onStatus({ type: "error", message: `Failed to close: ${msg}` });
    } finally {
      setClosing(false);
    }
  };

  const isCreator =
    publicKey &&
    poll.creator &&
    (poll.creator === publicKey ||
      poll.creator.includes(publicKey.slice(1, 10)));

  return (
    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-500 text-xs">#{poll.id}</span>
            {!poll.active && (
              <span className="flex items-center gap-1 text-yellow-400 text-xs">
                <FaLock size={10} /> Closed
              </span>
            )}
          </div>
          <h4 className="text-white font-medium">{poll.question}</h4>
        </div>
        <span className="text-gray-400 text-xs whitespace-nowrap ml-2">
          {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-2">
        {poll.options.map((option, i) => {
          const voteCount = displayVotes[i] ?? 0;
          const percentage =
            poll.totalVotes > 0
              ? Math.round((voteCount / poll.totalVotes) * 100)
              : 0;
          const isVoting = votingIndex === i;

          return (
            <div key={i} className="relative">
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-purple-500/20 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <button
                onClick={() => handleVote(i)}
                disabled={!poll.active || poll.userVoted || isVoting}
                className={`relative w-full text-left px-4 py-2.5 rounded-lg border transition-all ${
                  poll.userVoted
                    ? "border-white/10 cursor-default"
                    : "border-white/10 hover:border-purple-500/50 cursor-pointer hover:bg-white/5"
                } ${isVoting ? "opacity-50" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm flex items-center gap-2">
                    {poll.userVoted && voteCount > 0 && (
                      <FaCheck className="text-purple-400" size={12} />
                    )}
                    {option}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {voteCount} ({percentage}%)
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {isCreator && poll.active && (
        <button
          onClick={handleClose}
          disabled={closing}
          className="mt-3 w-full text-center text-red-400 hover:text-red-300 text-xs py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
        >
          {closing ? "Closing..." : "Close Poll"}
        </button>
      )}
    </div>
  );
}
