'use client';

import { User, ArrowRight, Download, Ban } from 'lucide-react';
import StreamCounter from './StreamCounter';
import { Stream, StreamStatus } from '../types';
import { XLM_TOKEN_ADDRESS } from '../lib/contract';

interface StreamCardProps {
  stream: Stream;
  userAddress: string;
  onWithdraw: (id: string) => void;
  onCancel: (id: string) => void;
}

// Helper function to determine stream status
function getStreamStatus(stream: Stream): StreamStatus {
  // Priority 1: Use status from contract if available
  if (stream.status) return stream.status;

  // Priority 2: Check is_cancelled flag from contract
  if (stream.isCancelled) return 'CANCELLED';

  // Priority 3: Calculate based on time and remaining balance
  const now = Date.now() / 1000;

  if (now < stream.startTime) return 'UPCOMING';

  // Check COMPLETED: All funds must be withdrawn (remaining balance ~0)
  // Using deposit vs withdrawn comparison for accuracy
  const totalWithdrawn = stream.withdrawn || 0;
  const totalDeposit = stream.deposit || 0;
  const fullyWithdrawn = totalDeposit > 0 && Math.abs(totalDeposit - totalWithdrawn) < 0.0000001;

  if (fullyWithdrawn) {
    return 'COMPLETED';
  }

  // If past stop time but not fully withdrawn, still ACTIVE (can withdraw remaining)
  return 'ACTIVE';
}

// Helper function for status badge styling
function getStatusBadgeStyle(status: StreamStatus) {
  switch (status) {
    case 'UPCOMING':
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        label: 'Upcoming',
      };
    case 'ACTIVE':
      return {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        text: 'text-green-400',
        label: 'Active',
      };
    case 'COMPLETED':
      return {
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/30',
        text: 'text-slate-400',
        label: 'Completed',
      };
    case 'CANCELLED':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        label: 'Cancelled',
      };
  }
}

export default function StreamCard({ stream, userAddress, onWithdraw, onCancel }: StreamCardProps) {
  const isRecipient = stream.recipient === userAddress;
  const isSender = stream.sender === userAddress;
  const progress = Math.min(
    100,
    ((Date.now() / 1000 - stream.startTime) / (stream.stopTime - stream.startTime)) * 100,
  );

  const status = getStreamStatus(stream);
  const statusStyle = getStatusBadgeStyle(status);

  const tokenSymbol =
    stream.tokenAddress === XLM_TOKEN_ADDRESS
      ? 'XLM'
      : `${stream.tokenAddress.slice(0, 3)}...${stream.tokenAddress.slice(-3)}`;

  return (
    <div className="glass rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
      {/* Progress Bar Background */}
      <div className="absolute bottom-0 left-0 h-1 bg-slate-800 w-full">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <User size={20} />
          </div>
          <div>
            <div className="text-sm text-slate-400">From</div>
            <div className="font-mono text-sm">
              {stream.sender.slice(0, 4)}...{stream.sender.slice(-4)}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`px-3 py-1 rounded-full border text-xs font-medium ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}
        >
          {statusStyle.label}
        </div>

        <ArrowRight className="text-slate-600" />
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-sm text-slate-400">To</div>
            <div className="font-mono text-sm">
              {stream.recipient.slice(0, 4)}...{stream.recipient.slice(-4)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
            <User size={20} />
          </div>
        </div>
      </div>

      <div className="py-4 border-t border-slate-800 border-b mb-6">
        <StreamCounter
          startTime={Number(stream.startTime)}
          stopTime={Number(stream.stopTime)}
          ratePerSecond={Number(stream.ratePerSecond)}
          withdrawn={Number(stream.withdrawn)}
          isRecipient={isRecipient}
          tokenSymbol={tokenSymbol}
        />
      </div>

      <div className="flex gap-3">
        {isRecipient &&
          status === 'ACTIVE' &&
          (() => {
            // Calculate available amount
            const now = Date.now() / 1000;
            const elapsed = Math.min(now, stream.stopTime) - stream.startTime;
            const totalVested = elapsed * stream.ratePerSecond;
            const available = Math.max(0, totalVested - stream.withdrawn);
            const hasAvailable = available > 0.000001; // More than 1 stroop

            return (
              <button
                onClick={() => onWithdraw(stream.id)}
                disabled={!hasAvailable}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={16} />
                {hasAvailable ? 'Withdraw' : 'All Withdrawn'}
              </button>
            );
          })()}
        {isSender && (status === 'UPCOMING' || status === 'ACTIVE') && (
          <button
            onClick={() => onCancel(stream.id)}
            className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Ban size={16} />
            Cancel
          </button>
        )}
        {(status === 'COMPLETED' || status === 'CANCELLED') && (
          <div className="flex-1 text-center py-2 text-slate-500 text-sm">
            {status === 'COMPLETED' ? '✓ Stream completed' : '✗ Stream cancelled'}
          </div>
        )}
      </div>
    </div>
  );
}
