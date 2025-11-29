'use client';

import { User, ArrowRight, Download, Ban, Play, Pause } from 'lucide-react';
import StreamCounter from './StreamCounter';
import { Stream, StreamStatus } from '../types';
import { XLM_TOKEN_ADDRESS } from '../lib/contract';

interface StreamCardProps {
  stream: Stream;
  userAddress: string;
  onWithdraw: (id: string) => void;
  onCancel: (id: string) => void;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
}

// Helper function to determine stream status
function getStreamStatus(stream: Stream): StreamStatus {
  if (stream.isCancelled) return 'CANCELLED';
  
  // If remaining balance is 0 (or close to), it's COMPLETED
  const totalDeposit = stream.deposit || 0;
  if (totalDeposit > 0 && stream.remainingBalance < 0.0000001) {
      return 'COMPLETED';
  }

  if (stream.isRunning) return 'ACTIVE';
  
  // If not running, but has accrued time > 0, it's PAUSED
  if (stream.totalAccrued > 0) return 'PAUSED';

  return 'UPCOMING';
}

// Helper function for status badge styling
function getStatusBadgeStyle(status: StreamStatus) {
  switch (status) {
    case 'UPCOMING':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        text: 'text-blue-600',
        label: 'Ready to Start',
      };
    case 'ACTIVE':
      return {
        bg: 'bg-green-50',
        border: 'border-green-100',
        text: 'text-green-600',
        label: 'Working (Active)',
      };
    case 'PAUSED':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-100',
        text: 'text-yellow-600',
        label: 'Paused',
      };
    case 'COMPLETED':
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-200',
        text: 'text-gray-600',
        label: 'Completed',
      };
    case 'CANCELLED':
      return {
        bg: 'bg-red-50',
        border: 'border-red-100',
        text: 'text-red-600',
        label: 'Cancelled',
      };
    default:
        return {
            bg: 'bg-gray-50',
            border: 'border-gray-100',
            text: 'text-gray-600',
            label: status,
        };
  }
}

export default function StreamCard({ stream, userAddress, onWithdraw, onCancel, onStart, onStop }: StreamCardProps) {
  const isRecipient = stream.recipient === userAddress;
  const isSender = stream.sender === userAddress;
  
  // Progress based on budget used
  const totalEarned = stream.totalAccrued + (stream.isRunning ? (Date.now()/1000 - stream.lastUpdateTime) * stream.ratePerSecond : 0);
  const progress = Math.min(100, (totalEarned / stream.deposit) * 100);

  const status = getStreamStatus(stream);
  const statusStyle = getStatusBadgeStyle(status);

  const tokenSymbol =
    stream.tokenAddress === XLM_TOKEN_ADDRESS
      ? 'XLM'
      : `${stream.tokenAddress.slice(0, 3)}...${stream.tokenAddress.slice(-3)}`;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-md transition-all duration-300">
      {/* Progress Bar Background */}
      <div className="absolute top-0 left-0 h-1 bg-gray-100 w-full">
        <div
          className={`h-full transition-all duration-1000 ${
            status === 'COMPLETED' ? 'bg-gray-400' : 'bg-indigo-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between items-start mb-8 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <User size={20} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">From</div>
            <div className="font-mono text-sm text-gray-600 font-medium">
              {stream.sender.slice(0, 4)}...{stream.sender.slice(-4)}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`px-3 py-1 rounded-full border text-xs font-bold ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}
        >
          {statusStyle.label}
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">To</div>
            <div className="font-mono text-sm text-gray-600 font-medium">
              {stream.recipient.slice(0, 4)}...{stream.recipient.slice(-4)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <User size={20} />
          </div>
        </div>
      </div>

      <div className="py-6 border-t border-gray-100 border-b mb-6">
        <div className="text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-2">
            Available to Withdraw
          </p>
          <StreamCounter
            startTime={Number(stream.lastUpdateTime)} // Using last update time as base for counter
            stopTime={stream.isRunning ? Number.MAX_SAFE_INTEGER : Number(stream.lastUpdateTime)}
            ratePerSecond={stream.isRunning ? Number(stream.ratePerSecond) : 0}
            withdrawn={Number(stream.withdrawn)}
            baseEarned={Number(stream.totalAccrued)} // Pass accumulated earnings
            maxAmount={Number(stream.deposit)} // Cap at total deposit
            isRecipient={isRecipient}
            tokenSymbol={tokenSymbol}
          />
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {isRecipient && (
            <>
                {/* Start/Stop Controls */}
                {!stream.isRunning && !stream.isCancelled && stream.remainingBalance > 0 && stream.totalAccrued < stream.deposit && (
                    <button
                        onClick={() => onStart(stream.id)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                        <Play size={18} />
                        Start Work
                    </button>
                )}
                
                {stream.isRunning && !stream.isCancelled && (
                    <button
                        onClick={() => onStop(stream.id)}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                        <Pause size={18} />
                        Pause Work
                    </button>
                )}

                {/* Withdraw Button */}
                {(() => {
                    // Calculate available amount
                    const now = Date.now() / 1000;
                    const currentSession = stream.isRunning ? (now - stream.lastUpdateTime) * stream.ratePerSecond : 0;
                    const totalVested = stream.totalAccrued + currentSession;
                    // Available = Total Vested - (Deposit - Remaining)
                    // Wait, withdrawn is tracked separately in our type?
                    // Let's assume stream.withdrawn is correct.
                    const available = Math.max(0, totalVested - stream.withdrawn);
                    const hasAvailable = available > 0.000001;

                    return (
                    <button
                        onClick={() => onWithdraw(stream.id)}
                        disabled={!hasAvailable}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-green-200"
                    >
                        <Download size={18} />
                        {hasAvailable ? 'Withdraw' : 'Withdraw'}
                    </button>
                    );
                })()}
            </>
        )}
        
        {isSender && !stream.isCancelled && stream.remainingBalance > 0 && (
          <button
            onClick={() => onCancel(stream.id)}
            className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Ban size={18} />
            Cancel
          </button>
        )}
        
        {(status === 'COMPLETED' || status === 'CANCELLED') && (
          <div className="flex-1 text-center py-2.5 text-gray-400 text-sm font-medium bg-gray-50 rounded-lg w-full">
            {status === 'COMPLETED' ? '✓ Stream completed' : '✗ Stream cancelled'}
          </div>
        )}
      </div>
    </div>
  );
}
