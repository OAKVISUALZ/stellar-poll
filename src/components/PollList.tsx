import { useEffect, useState, useCallback } from "react";
import { FaSync, FaVoteYea } from "react-icons/fa";
import {
  getPollCount,
  getPollData,
  getPollResults,
  hasVotedOnPoll,
} from "../lib/contract";
import { PollCard } from "./PollCard";

interface PollListProps {
  contractId: string;
  publicKey: string;
  refreshTrigger: number;
  onStatus: (status: {
    type: "pending" | "success" | "error";
    message: string;
    hash?: string;
  } | null) => void;
}

interface PollInfo {
  id: number;
  question: string;
  options: string[];
  votes: number[];
  creator: string;
  totalVotes: number;
  active: boolean;
  userVoted: boolean;
}

export function PollList({
  contractId,
  publicKey,
  refreshTrigger,
  onStatus,
}: PollListProps) {
  const [polls, setPolls] = useState<PollInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolls = useCallback(async () => {
    try {
      setLoading(true);
      const count = await getPollCount(contractId);
      const pollData: PollInfo[] = [];

      for (let i = count - 1; i >= 0; i--) {
        const data = await getPollData(contractId, i);
        if (data) {
          const voted = await hasVotedOnPoll(contractId, i, publicKey);
          const votes = await getPollResults(contractId, i);
          pollData.push({
            ...data,
            votes: votes.length > 0 ? votes : data.votes,
            userVoted: voted,
          });
        }
      }

      setPolls(pollData);
    } catch (err) {
      console.error("Failed to fetch polls:", err);
    } finally {
      setLoading(false);
    }
  }, [contractId, publicKey]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls, refreshTrigger]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPolls();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchPolls]);

  if (loading && polls.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <FaVoteYea className="text-blue-400" />
          </div>
          <h3 className="text-white font-semibold">Polls</h3>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 bg-white/5 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <FaVoteYea className="text-blue-400" />
          </div>
          <h3 className="text-white font-semibold">
            Active Polls ({polls.length})
          </h3>
        </div>
        <button
          onClick={fetchPolls}
          disabled={loading}
          className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          title="Refresh polls"
        >
          <FaSync className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {polls.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">
          No polls yet. Create one above!
        </p>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              contractId={contractId}
              publicKey={publicKey}
              onVoted={fetchPolls}
              onStatus={onStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
