'use client';

import { useState, useMemo } from 'react';
import { Stream, StreamStatus } from '../types';
import StreamCard from './StreamCard';
import { TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { XLM_TOKEN_ADDRESS } from '../lib/contract';

interface MyStreamsDashboardProps {
  streams: Stream[];
  walletAddress: string;
  onWithdraw: (streamId: string) => void;
  onCancel: (streamId: string) => void;
}

type TabType = 'sender' | 'recipient';
type FilterType = 'ALL' | StreamStatus;

/**
 * Calculate total amount for streams where user is the sender
 */
const calculateTotalPaid = (streams: Stream[], walletAddress: string): number => {
  return streams
    .filter((stream) => stream.sender === walletAddress)
    .reduce((total, stream) => total + stream.deposit, 0);
};

/**
 * Calculate total earned (withdrawn) for streams where user is the recipient
 */
const calculateTotalEarned = (streams: Stream[], walletAddress: string): number => {
  return streams
    .filter((stream) => stream.recipient === walletAddress)
    .reduce((total, stream) => total + stream.withdrawn, 0);
};

/**
 * Calculate current vested amount for an active stream
 */
const calculateVestedAmount = (stream: Stream): number => {
  const now = Date.now() / 1000;
  const elapsed = Math.min(now, stream.stopTime) - stream.startTime;
  return Math.max(0, elapsed * stream.ratePerSecond);
};

/**
 * Get token symbol from address
 */
const getTokenSymbol = (tokenAddress: string): string => {
  if (tokenAddress === XLM_TOKEN_ADDRESS) return 'XLM';
  return `${tokenAddress.slice(0, 3)}...${tokenAddress.slice(-3)}`;
};

export default function MyStreamsDashboard({
  streams,
  walletAddress,
  onWithdraw,
  onCancel,
}: MyStreamsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('sender');
  const [statusFilter, setStatusFilter] = useState<FilterType>('ALL');

  // Filter streams based on active tab
  const tabFilteredStreams = useMemo(() => {
    return streams.filter((stream) => {
      if (activeTab === 'sender') {
        return stream.sender === walletAddress;
      } else {
        return stream.recipient === walletAddress;
      }
    });
  }, [streams, walletAddress, activeTab]);

  // Apply status filter
  const filteredStreams = useMemo(() => {
    if (statusFilter === 'ALL') return tabFilteredStreams;
    return tabFilteredStreams.filter((stream) => stream.status === statusFilter);
  }, [tabFilteredStreams, statusFilter]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalPaid = calculateTotalPaid(streams, walletAddress);
    const totalEarned = calculateTotalEarned(streams, walletAddress);

    // Group by token
    const tokenSummary: Record<string, { paid: number; earned: number }> = {};

    streams.forEach((stream) => {
      const symbol = getTokenSymbol(stream.tokenAddress);
      if (!tokenSummary[symbol]) {
        tokenSummary[symbol] = { paid: 0, earned: 0 };
      }

      if (stream.sender === walletAddress) {
        tokenSummary[symbol].paid += stream.deposit;
      }
      if (stream.recipient === walletAddress) {
        tokenSummary[symbol].earned += stream.withdrawn;
      }
    });

    return { totalPaid, totalEarned, tokenSummary };
  }, [streams, walletAddress]);

  // Count streams by status for current tab
  const streamCounts = useMemo(() => {
    const counts = {
      ALL: tabFilteredStreams.length,
      UPCOMING: 0,
      ACTIVE: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    tabFilteredStreams.forEach((stream) => {
      if (stream.status) {
        counts[stream.status]++;
      }
    });

    return counts;
  }, [tabFilteredStreams]);

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Paid */}
        <div className="glass rounded-xl p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Total Paid (as Sender)</h3>
            <TrendingDown className="text-red-400" size={20} />
          </div>
          {Object.entries(summary.tokenSummary).map(([token, amounts]) =>
            amounts.paid > 0 ? (
              <div key={token} className="mb-1">
                <p className="text-2xl font-bold text-white">
                  {amounts.paid.toFixed(7)} <span className="text-lg text-slate-400">{token}</span>
                </p>
              </div>
            ) : null,
          )}
          {summary.totalPaid === 0 && <p className="text-2xl font-bold text-slate-600">0 XLM</p>}
          <p className="text-xs text-slate-500 mt-2">
            {streams.filter((s) => s.sender === walletAddress).length} stream(s)
          </p>
        </div>

        {/* Total Earned */}
        <div className="glass rounded-xl p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Total Earned (as Recipient)</h3>
            <TrendingUp className="text-green-400" size={20} />
          </div>
          {Object.entries(summary.tokenSummary).map(([token, amounts]) =>
            amounts.earned > 0 ? (
              <div key={token} className="mb-1">
                <p className="text-2xl font-bold text-white">
                  {amounts.earned.toFixed(7)}{' '}
                  <span className="text-lg text-slate-400">{token}</span>
                </p>
              </div>
            ) : null,
          )}
          {summary.totalEarned === 0 && <p className="text-2xl font-bold text-slate-600">0 XLM</p>}
          <p className="text-xs text-slate-500 mt-2">
            {streams.filter((s) => s.recipient === walletAddress).length} stream(s)
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-xl p-2 inline-flex gap-2">
        <button
          onClick={() => {
            setActiveTab('sender');
            setStatusFilter('ALL');
          }}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'sender'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          As Sender
          <span className="ml-2 text-xs opacity-70">
            ({streams.filter((s) => s.sender === walletAddress).length})
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab('recipient');
            setStatusFilter('ALL');
          }}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'recipient'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          As Recipient
          <span className="ml-2 text-xs opacity-70">
            ({streams.filter((s) => s.recipient === walletAddress).length})
          </span>
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter size={16} />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        {(['ALL', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as FilterType[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === filter
                ? 'bg-slate-700 text-white border border-slate-600'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            {filter.charAt(0) + filter.slice(1).toLowerCase()}
            <span className="ml-1.5 text-xs opacity-70">
              ({filter === 'ALL' ? streamCounts.ALL : streamCounts[filter as StreamStatus] || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Streams Grid */}
      <div>
        {filteredStreams.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <div className="text-slate-600 mb-2">
              <Filter size={48} className="mx-auto mb-3 opacity-30" />
            </div>
            <h3 className="text-slate-400 font-medium mb-1">No streams found</h3>
            <p className="text-slate-500 text-sm">
              {statusFilter === 'ALL'
                ? `No streams where you are the ${activeTab}`
                : `No ${statusFilter.toLowerCase()} streams in this category`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStreams.map((stream) => (
              <StreamCard
                key={stream.id}
                stream={stream}
                userAddress={walletAddress}
                onWithdraw={onWithdraw}
                onCancel={onCancel}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      {filteredStreams.length > 0 && (
        <div className="glass rounded-xl p-4 flex justify-between items-center text-sm">
          <div className="text-slate-400">
            Showing <span className="text-white font-medium">{filteredStreams.length}</span> of{' '}
            <span className="text-white font-medium">{tabFilteredStreams.length}</span> streams
          </div>
          {activeTab === 'recipient' && (
            <div className="text-slate-400">
              Available to withdraw:{' '}
              <span className="text-green-400 font-medium">
                {filteredStreams
                  .filter((s) => s.status === 'ACTIVE')
                  .reduce((total, stream) => {
                    const vested = calculateVestedAmount(stream);
                    const available = Math.max(0, vested - stream.withdrawn);
                    return total + available;
                  }, 0)
                  .toFixed(7)}{' '}
                {getTokenSymbol(filteredStreams[0]?.tokenAddress || XLM_TOKEN_ADDRESS)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
