'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, RefreshCw, Download, Clock } from 'lucide-react';
import {
  createStream,
  withdrawFromStream,
  cancelStream,
  getStream,
  getNextStreamId,
  getStreamStatus,
  XLM_TOKEN_ADDRESS,
  getErrorMessage,
} from '@/lib/contract';

import MyStreamsDashboard from '@/components/MyStreamsDashboard';
import CreateStreamModal from '@/components/CreateStreamModal';
import WithdrawModal from '@/components/WithdrawModal';
import { Stream } from '@/types';

export default function AdminStreamPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [maxWithdrawAmount, setMaxWithdrawAmount] = useState(0);

  useEffect(() => {
    // Get wallet address from localStorage (set by Sidebar/Layout)
    const storedWallet = localStorage.getItem('walletAddress');
    if (storedWallet) {
      setWalletAddress(storedWallet);
    }

    // Listen for storage events to update wallet if it changes
    const handleStorageChange = () => {
      const currentWallet = localStorage.getItem('walletAddress');
      if (currentWallet !== walletAddress) {
        setWalletAddress(currentWallet);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [walletAddress]);

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
      await withdrawFromStream(selectedStreamId, amount, walletAddress);
      toast.success('✅ Çekim başarılı!');
      setIsWithdrawModalOpen(false);
      await fetchStreams();
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

  if (!walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-purple-100 p-4 rounded-full mb-4">
          <Clock className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Connect Wallet</h2>
        <p className="text-gray-500 max-w-md">
          Please connect your wallet using the sidebar button to access the Stream Dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stream Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage real-time payment streams</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={clearAllStreams}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            Clear All
          </button>
          <button
            onClick={fetchStreams}
            disabled={isLoading}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={restoreStreams}
            disabled={isLoading}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            <Download size={16} />
            Restore
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Create Stream
          </button>
        </div>
      </div>

      {isLoading && streams.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading streams...</div>
      ) : streams.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-gray-50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 shadow-sm">
            <Clock size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active streams</h3>
          <p className="text-gray-500 mb-6">
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
    </div>
  );
}
