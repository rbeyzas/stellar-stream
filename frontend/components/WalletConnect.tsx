"use client";

import { useState, useEffect } from "react";
import { connectWallet, checkConnection } from "../lib/stellar";
import { Wallet } from "lucide-react";

export default function WalletConnect({ onConnect }: { onConnect: (address: string) => void }) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    checkConnection().then((allowed) => {
      if (allowed) {
        // If already allowed, we can try to get address silently or wait for user action
        // For now, let's require explicit click
      }
    });
  }, []);

  const handleConnect = async () => {
    const addr = await connectWallet();
    if (addr) {
      setAddress(addr);
      onConnect(addr);
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all font-medium shadow-lg shadow-indigo-500/30"
    >
      <Wallet size={18} />
      {address ? (
        <span>
          {address.slice(0, 4)}...{address.slice(-4)}
        </span>
      ) : (
        "Connect Wallet"
      )}
    </button>
  );
}
