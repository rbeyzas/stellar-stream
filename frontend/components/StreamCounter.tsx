"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface StreamCounterProps {
  startTime: number;
  stopTime: number;
  ratePerSecond: number;
  withdrawn: number;
  isRecipient: boolean;
  tokenSymbol: string;
}

export default function StreamCounter({
  startTime,
  stopTime,
  ratePerSecond,
  withdrawn,
  isRecipient,
  tokenSymbol,
}: StreamCounterProps) {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now() / 1000;
      
      if (now < startTime) {
        setBalance(0);
        return;
      }

      const elapsed = Math.min(now, stopTime) - startTime;
      const totalVested = elapsed * ratePerSecond;
      
      if (isRecipient) {
        setBalance(Math.max(0, totalVested - withdrawn));
      } else {
        // For sender, show total amount that has been streamed (vested)
        setBalance(totalVested);
      }
    }, 50); // Update 20 times per second for smoothness

    return () => clearInterval(interval);
  }, [startTime, stopTime, ratePerSecond, withdrawn, isRecipient]);

  return (
    <div className="text-center">
      <div className="text-sm text-slate-400 mb-1 uppercase tracking-wider font-medium">
        {isRecipient ? "Available to Withdraw" : "Streamed So Far"}
      </div>
      <motion.div 
        className="text-4xl font-mono font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400"
        key={Math.floor(balance)} // Micro-animation on integer change
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        {balance.toFixed(7)} <span className="text-lg text-slate-500">{tokenSymbol}</span>
      </motion.div>
      <div className="text-xs text-slate-500 mt-1">
        + {ratePerSecond.toFixed(7)} / sec
      </div>
    </div>
  );
}
