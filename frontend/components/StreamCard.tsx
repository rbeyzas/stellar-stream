"use client";

import { User, ArrowRight, Download, Ban } from "lucide-react";
import StreamCounter from "./StreamCounter";
import { Stream } from "../types";
import { XLM_TOKEN_ADDRESS } from "../lib/contract";

interface StreamCardProps {
  stream: Stream;
  userAddress: string;
  onWithdraw: (id: string) => void;
  onCancel: (id: string) => void;
}

export default function StreamCard({ stream, userAddress, onWithdraw, onCancel }: StreamCardProps) {
  const isRecipient = stream.recipient === userAddress;
  const isSender = stream.sender === userAddress;
  const progress = Math.min(100, ((Date.now() / 1000 - stream.startTime) / (stream.stopTime - stream.startTime)) * 100);
  
  const tokenSymbol = stream.tokenAddress === XLM_TOKEN_ADDRESS 
    ? "XLM" 
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
            <div className="font-mono text-sm">{stream.sender.slice(0, 4)}...{stream.sender.slice(-4)}</div>
          </div>
        </div>
        <ArrowRight className="text-slate-600" />
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-sm text-slate-400">To</div>
            <div className="font-mono text-sm">{stream.recipient.slice(0, 4)}...{stream.recipient.slice(-4)}</div>
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
        {isRecipient && (
          <button 
            onClick={() => onWithdraw(stream.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={16} />
            Withdraw
          </button>
        )}
        {isSender && (
          <button 
            onClick={() => onCancel(stream.id)}
            className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Ban size={16} />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
