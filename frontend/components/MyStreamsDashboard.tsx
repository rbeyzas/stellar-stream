'use client';

import { useState, useMemo } from 'react';
import { Stream, StreamStatus } from '../types';
import StreamCard from './StreamCard';
import { TrendingUp, TrendingDown, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { XLM_TOKEN_ADDRESS } from '../lib/contract';

interface MyStreamsDashboardProps {
  streams: Stream[];
  walletAddress: string;
  onWithdraw: (streamId: string) => void;
  onCancel: (streamId: string) => void;
  onStart: (streamId: string) => void;
  onStop: (streamId: string) => void;
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
  const currentSession = stream.isRunning ? (now - stream.lastUpdateTime) * stream.ratePerSecond : 0;
  return stream.totalAccrued + currentSession;
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
  onStart,
  onStop,
}: MyStreamsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('recipient');
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
    return tabFilteredStreams.filter((stream) => {
        // Handle PAUSED status logic if not explicitly set
        if (statusFilter === 'PAUSED') {
            return !stream.isRunning && stream.totalAccrued > 0 && !stream.isCancelled;
        }
        if (statusFilter === 'ACTIVE') {
            return stream.isRunning;
        }
        return stream.status === statusFilter;
    });
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
      PAUSED: 0,
    };

    tabFilteredStreams.forEach((stream) => {
      if (stream.isCancelled) counts.CANCELLED++;
      else if (stream.isRunning) counts.ACTIVE++;
      else if (stream.totalAccrued > 0) counts.PAUSED++;
      else if (stream.status === 'COMPLETED') counts.COMPLETED++; // Fallback
      else counts.UPCOMING++;
    });

    return counts;
  }, [tabFilteredStreams]);

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Paid */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ArrowUpRight size={64} className="text-red-500" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Paid (as Sender)</h3>
            <div className="bg-red-50 p-2 rounded-lg">
              <TrendingDown className="text-red-500" size={20} />
            </div>
          </div>
          {Object.entries(summary.tokenSummary).map(([token, amounts]) =>
            amounts.paid > 0 ? (
              <div key={token} className="mb-1">
                <p className="text-3xl font-bold text-gray-900">
                  {amounts.paid.toFixed(7)} <span className="text-lg text-gray-400 font-medium">{token}</span>
                </p>
              </div>
            ) : null,
          )}
          {summary.totalPaid === 0 && <p className="text-3xl font-bold text-gray-900">0.0000000 <span className="text-lg text-gray-400 font-medium">XLM</span></p>}
          <p className="text-xs text-gray-400 mt-2 font-medium">
            {streams.filter((s) => s.sender === walletAddress).length} stream(s)
          </p>
        </div>

        {/* Total Earned */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ArrowDownLeft size={64} className="text-green-500" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Earned (as Recipient)</h3>
            <div className="bg-green-50 p-2 rounded-lg">
              <TrendingUp className="text-green-500" size={20} />
            </div>
          </div>
          {Object.entries(summary.tokenSummary).map(([token, amounts]) =>
            amounts.earned > 0 ? (
              <div key={token} className="mb-1">
                <p className="text-3xl font-bold text-gray-900">
                  {amounts.earned.toFixed(7)}{' '}
                  <span className="text-lg text-gray-400 font-medium">{token}</span>
                </p>
              </div>
            ) : null,
          )}
          {summary.totalEarned === 0 && <p className="text-3xl font-bold text-gray-900">0.0000000 <span className="text-lg text-gray-400 font-medium">XLM</span></p>}
          <p className="text-xs text-gray-400 mt-2 font-medium">
            {streams.filter((s) => s.recipient === walletAddress).length} stream(s)
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              setActiveTab('sender');
              setStatusFilter('ALL');
            }}
            className={`text-sm font-medium transition-colors ${
              activeTab === 'sender'
                ? 'text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            As Sender <span className="text-xs opacity-70 ml-1">({streams.filter((s) => s.sender === walletAddress).length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('recipient');
              setStatusFilter('ALL');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'recipient'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-200'
            }`}
          >
            As Recipient <span className="text-xs opacity-70 ml-1">({streams.filter((s) => s.recipient === walletAddress).length})</span>
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <div className="flex items-center gap-2 text-gray-400 mr-2">
            <Filter size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Filter:</span>
          </div>
          {(['ALL', 'UPCOMING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                statusFilter === filter
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {filter.charAt(0) + filter.slice(1).toLowerCase()}
              <span className="ml-1.5 opacity-60 font-normal">
                ({filter === 'ALL' ? streamCounts.ALL : streamCounts[filter as StreamStatus] || 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Streams Grid */}
      <div>
        {filteredStreams.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-16 text-center border-2 border-dashed border-gray-200">
            <div className="text-gray-300 mb-4">
              <Filter size={48} className="mx-auto" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">No streams found</h3>
            <p className="text-gray-500 text-sm">
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
                onStart={onStart}
                onStop={onStop}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      {filteredStreams.length > 0 && (
        <div className="flex justify-between items-center text-xs text-gray-400 pt-4 border-t border-gray-100">
          <div>
            Showing <span className="text-gray-600 font-medium">{filteredStreams.length}</span> of{' '}
            <span className="text-gray-600 font-medium">{tabFilteredStreams.length}</span> streams
          </div>
          {activeTab === 'recipient' && (
            <div>
              Available to withdraw:{' '}
              <span className="text-green-600 font-bold text-sm">
                {filteredStreams
                  .filter((s) => s.isRunning)
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
