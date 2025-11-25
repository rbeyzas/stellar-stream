'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import WalletConnect from '../components/WalletConnect';
import CreateStreamModal from '../components/CreateStreamModal';
import StreamCard from '../components/StreamCard';
import WithdrawModal from '../components/WithdrawModal';
import MyStreamsDashboard from '../components/MyStreamsDashboard';
import { Plus, ArrowRight, Clock, DollarSign, RefreshCw, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  createStream,
  withdrawFromStream,
  cancelStream,
  getStream,
  getNextStreamId,
  getStreamStatus,
  XLM_TOKEN_ADDRESS,
  getErrorMessage,
} from '../lib/contract';
import { Stream } from '../types';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [maxWithdrawAmount, setMaxWithdrawAmount] = useState(0);

  // Load streams from local storage on mount, then auto-restore
  useEffect(() => {
    if (walletAddress) {
      fetchStreams().then(() => {
        // Auto-restore streams on first load to catch any streams where user is recipient
        restoreStreams();
      });
    }
  }, [walletAddress]);

  const fetchStreams = async () => {
    setIsLoading(true);
    try {
      const storedIds = JSON.parse(localStorage.getItem('stream_ids') || '[]');
      const streamPromises = storedIds.map(async (id: string) => {
        try {
          const data = await getStream(id);
          if (data) {
            // Fetch real status from contract
            const status = await getStreamStatus(id);
            console.log('🔄 fetchStreams - Stream data:', {
              id,
              remainingBalance: Number(data.remaining_balance) / 10000000,
              status,
              isCancelled: data.is_cancelled,
            });

            return {
              id,
              sender: data.sender.toString(),
              recipient: data.recipient.toString(),
              startTime: Number(data.start_time),
              stopTime: Number(data.stop_time),
              ratePerSecond: Number(data.rate_per_second) / 10000000, // Convert stroops to units
              deposit: Number(data.deposit) / 10000000,
              remainingBalance: Number(data.remaining_balance) / 10000000,
              withdrawn: (Number(data.deposit) - Number(data.remaining_balance)) / 10000000,
              tokenAddress: data.token_address.toString(),
              status: status || undefined,
              isCancelled: data.is_cancelled || false,
            } as Stream;
          }
          return null;
        } catch (e) {
          console.error(`Error fetching stream ${id}`, e);
          return null;
        }
      });

      const results = await Promise.all(streamPromises);
      const activeStreams = results.filter((s) => s !== null) as Stream[];

      // Update local storage to remove nulls (cancelled/invalid streams)
      const activeIds = activeStreams.map((s) => s.id);
      localStorage.setItem('stream_ids', JSON.stringify(activeIds));

      setStreams(activeStreams);
    } catch (error) {
      console.error('Failed to fetch streams', error);
      toast.error('Failed to fetch streams');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllStreams = () => {
    if (confirm('⚠️ Bu işlem tüm stream kayıtlarını silecek. Emin misiniz?')) {
      localStorage.removeItem('stream_ids');
      setStreams([]);
      toast.success('✅ Tüm stream kayıtları temizlendi');
    }
  };

  const restoreStreams = async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    toast.info('Scanning blockchain for your streams...');

    try {
      const nextId = await getNextStreamId();
      const foundStreams: Stream[] = [];
      const foundIds: string[] = [];

      // Scan last 100 streams
      const startId = Math.max(0, Number(nextId) - 100);
      const endId = Number(nextId);

      for (let i = startId; i < endId; i++) {
        try {
          const id = i.toString();
          const data = await getStream(id);

          if (
            data &&
            (data.sender.toString() === walletAddress ||
              data.recipient.toString() === walletAddress)
          ) {
            // Fetch real status from contract
            const status = await getStreamStatus(id);

            foundStreams.push({
              id,
              sender: data.sender.toString(),
              recipient: data.recipient.toString(),
              startTime: Number(data.start_time),
              stopTime: Number(data.stop_time),
              ratePerSecond: Number(data.rate_per_second) / 10000000,
              deposit: Number(data.deposit) / 10000000,
              remainingBalance: Number(data.remaining_balance) / 10000000,
              withdrawn: (Number(data.deposit) - Number(data.remaining_balance)) / 10000000,
              tokenAddress: data.token_address.toString(),
              status: status || undefined,
              isCancelled: data.is_cancelled || false,
            });
            foundIds.push(id);
          }
        } catch (e) {
          // Stream might not exist or error
        }
      }

      setStreams(foundStreams);
      localStorage.setItem('stream_ids', JSON.stringify(foundIds));
      toast.success(`Found ${foundStreams.length} streams!`);
    } catch (error) {
      console.error('Failed to restore streams', error);
      toast.error('Failed to restore streams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStream = async (data: any) => {
    if (!walletAddress) return;

    try {
      const nextId = await getNextStreamId();
      const streamId = nextId.toString();

      const tokenAddress = data.token === 'XLM' ? XLM_TOKEN_ADDRESS : data.token;

      await createStream(
        walletAddress,
        data.recipient,
        data.amount,
        tokenAddress,
        data.duration,
        data.startTime,
      );

      const newStream: Stream = {
        id: streamId,
        sender: walletAddress,
        recipient: data.recipient,
        startTime:
          data.startTime === 'now' ? Date.now() / 1000 : new Date(data.startTime).getTime() / 1000,
        stopTime:
          (data.startTime === 'now'
            ? Date.now() / 1000
            : new Date(data.startTime).getTime() / 1000) + parseInt(data.duration),
        ratePerSecond: parseFloat(data.amount) / parseInt(data.duration),
        withdrawn: 0,
        deposit: parseFloat(data.amount),
        tokenAddress: tokenAddress,
        isOptimistic: true,
      };

      setStreams([...streams, newStream]);

      // Save to local storage
      const storedIds = JSON.parse(localStorage.getItem('stream_ids') || '[]');
      if (!storedIds.includes(streamId)) {
        localStorage.setItem('stream_ids', JSON.stringify([...storedIds, streamId]));
      }

      setIsModalOpen(false);
      toast.success('✅ Stream başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Failed to create stream', error);
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
    }
  };

  const handleWithdrawClick = (streamId: string) => {
    const stream = streams.find((s) => s.id === streamId);
    if (!stream) return;

    // Calculate available amount
    const now = Date.now() / 1000;
    const elapsed = Math.min(now, stream.stopTime) - stream.startTime;
    const totalVested = elapsed * stream.ratePerSecond;
    const available = Math.max(0, totalVested - stream.withdrawn);

    setSelectedStreamId(streamId);
    setMaxWithdrawAmount(available);
    setIsWithdrawModalOpen(true);
  };

  const handleWithdrawSubmit = async (amount: string) => {
    if (!walletAddress || !selectedStreamId) return;

    try {
      console.log('💰 Starting withdrawal:', {
        streamId: selectedStreamId,
        amount,
        wallet: walletAddress,
      });
      await withdrawFromStream(selectedStreamId, amount, walletAddress);
      toast.success('✅ Çekim başarılı!');
      setIsWithdrawModalOpen(false);
      console.log('🔄 Withdrawal successful, refreshing streams...');
      await fetchStreams();
      console.log('✅ Streams refreshed after withdrawal');
    } catch (error) {
      console.error('Withdraw failed', error);
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
    }
  };

  const handleCancel = async (streamId: string) => {
    if (!walletAddress) return;

    if (
      !confirm(
        "Bu stream'i iptal etmek istediğinizden emin misiniz? Kalan fonlar gönderene iade edilecek.",
      )
    ) {
      return;
    }

    try {
      await cancelStream(streamId, walletAddress);
      setStreams(streams.filter((s) => s.id !== streamId));

      // Remove from local storage
      const storedIds = JSON.parse(localStorage.getItem('stream_ids') || '[]');
      const newIds = storedIds.filter((id: string) => id !== streamId);
      localStorage.setItem('stream_ids', JSON.stringify(newIds));

      toast.success('✅ Stream başarıyla iptal edildi');
    } catch (error) {
      console.error('Cancel failed', error);
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg">
              S
            </div>
            <span className="font-bold text-xl tracking-tight">StellarStream</span>
          </div>
          <WalletConnect onConnect={setWalletAddress} />
        </div>
      </nav>

      {/* Hero / Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!walletAddress ? (
          <div className="text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-6">
                Real-time Payments <br /> on Stellar
              </h1>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10">
                Stream salaries, subscriptions, and grants by the second. No more waiting for
                payday.
              </p>
              <div className="flex justify-center gap-4">
                <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors">
                  Get Started
                </button>
                <button className="border border-slate-700 px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors">
                  View Demo
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">My Streams Dashboard</h2>
              <div className="flex gap-3">
                <button
                  onClick={clearAllStreams}
                  className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={fetchStreams}
                  disabled={isLoading}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
                <button
                  onClick={restoreStreams}
                  disabled={isLoading}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download size={18} />
                  Restore
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus size={18} />
                  Create Stream
                </button>
              </div>
            </div>

            {isLoading && streams.length === 0 ? (
              <div className="text-center py-12 text-slate-500">Loading streams...</div>
            ) : streams.length === 0 ? (
              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <Clock size={32} />
                </div>
                <h3 className="text-lg font-medium mb-2">No active streams</h3>
                <p className="text-slate-500 mb-6">
                  Create a stream to start sending funds in real-time.
                </p>
              </div>
            ) : (
              <MyStreamsDashboard
                streams={streams}
                walletAddress={walletAddress}
                onWithdraw={handleWithdrawClick}
                onCancel={handleCancel}
              />
            )}
          </div>
        )}
      </div>

      <CreateStreamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateStream}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onSubmit={handleWithdrawSubmit}
        maxAmount={maxWithdrawAmount}
      />
    </main>
  );
}
