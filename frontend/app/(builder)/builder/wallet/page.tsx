'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, Send, ArrowDownToLine, ExternalLink, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'payment' | 'create_account' | 'other';
  amount?: string;
  asset?: string;
  from: string;
  to: string;
  date: string;
  hash: string;
  isIncoming: boolean;
}

export default function WalletPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedWallet = localStorage.getItem('walletAddress');
    if (storedWallet) {
      setWalletAddress(storedWallet);
      fetchWalletData(storedWallet);
    }
  }, []);

  const fetchWalletData = async (address: string) => {
    setIsLoading(true);
    try {
      // Fetch Balance
      const accountRes = await fetch(`https://horizon-testnet.stellar.org/accounts/${address}`);
      if (accountRes.ok) {
        const accountData = await accountRes.json();
        const xlmBalance = accountData.balances.find((b: any) => b.asset_type === 'native');
        setBalance(xlmBalance ? parseFloat(xlmBalance.balance).toFixed(2) : '0.00');
      }

      // 1. Fetch Horizon Transactions (Standard Payments)
      let horizonTxs: Transaction[] = [];
      const txRes = await fetch(`https://horizon-testnet.stellar.org/accounts/${address}/payments?limit=20&order=desc`);
      if (txRes.ok) {
        const txData = await txRes.json();
        horizonTxs = txData._embedded.records.map((record: any) => {
          const isIncoming = record.to === address;
          return {
            id: record.id,
            type: record.type === 'create_account' ? 'create_account' : 'payment',
            amount: record.amount || record.starting_balance,
            asset: record.asset_type === 'native' ? 'XLM' : 'Token',
            from: record.from,
            to: record.to,
            date: record.created_at,
            hash: record.transaction_hash,
            isIncoming,
          };
        });
      }

      // 2. Fetch DB Payments (Stream Withdrawals & Admin Payments)
      // We fetch all payments and filter client-side for now, or we could add a query param to API
      // Ideally API should support ?to=address
      let dbTxs: Transaction[] = [];
      const dbRes = await fetch('/api/payments');
      if (dbRes.ok) {
        const dbPayments = await dbRes.json();
        // Filter for this user's wallet
        dbTxs = dbPayments
          .filter((p: any) => p.to === address)
          .map((p: any) => ({
            id: p.id,
            type: 'payment',
            amount: p.amount.toString(),
            asset: p.token,
            from: p.from,
            to: p.to,
            date: p.createdAt,
            hash: p.txHash || '',
            isIncoming: true, // If it's in DB as 'to' this user, it's incoming
          }));
      }

      // 3. Merge and Sort
      // We prioritize DB transactions for withdrawals because they have better metadata
      // Deduplicate based on hash if possible.
      // We put horizonTxs FIRST, then dbTxs, so that dbTxs overwrite horizonTxs in the Map if keys match.
      
      const allTxs = [...horizonTxs, ...dbTxs];
      const uniqueTxs = Array.from(new Map(allTxs.map(item => [item.hash || item.id, item])).values());
      
      // Sort by date desc
      uniqueTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTransactions(uniqueTxs);

    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to fetch wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Address copied to clipboard!');
    }
  };

  if (!walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-purple-100 p-4 rounded-full mb-4">
          <WalletIcon className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Connect Wallet</h2>
        <p className="text-gray-500 max-w-md">
          Please connect your wallet using the sidebar button to view your wallet details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-500 mt-1">Manage your crypto wallet</p>
        </div>
        <button 
          onClick={() => fetchWalletData(walletAddress)}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <WalletIcon className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Your Wallet</h2>
          </div>
          <div className="mb-6">
            <p className="text-sm text-white/70 mb-2">Total Balance</p>
            <p className="text-4xl font-bold">{balance} XLM</p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-white/80 bg-white/10 px-3 py-2 rounded-lg w-fit cursor-pointer hover:bg-white/20 transition-colors" onClick={copyToClipboard}>
            <span className="font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
        
        {isLoading && transactions.length === 0 ? (
           <div className="flex justify-center py-12">
             <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
           </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <ArrowDownToLine className="w-12 h-12 mb-3 opacity-20" />
            <p>No transactions found on Testnet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.isIncoming ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {tx.isIncoming ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {tx.isIncoming ? 'Received' : 'Sent'} {tx.asset}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.isIncoming ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.isIncoming ? '+' : '-'}{parseFloat(tx.amount || '0').toFixed(2)} {tx.asset}
                  </p>
                  <a 
                    href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:text-purple-700 flex items-center justify-end gap-1 mt-1"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
