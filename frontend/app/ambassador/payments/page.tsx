'use client';

import { useState, useEffect } from 'react';
import StreamCard from '@/components/ambassador/StreamCard';
import { StreamLink } from '@/lib/types/ambassador';
import { getMyStreams } from '@/lib/api/ambassador';

export default function PaymentsPage() {
  const [streams, setStreams] = useState<StreamLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyStreams();
      setStreams(data.streams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment streams');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStream = (streamId: string) => {
    // In a real app, this would open the StellarStream widget
    console.log('View stream:', streamId);
    alert(
      `Opening stream: ${streamId}\n\nIn production, this would open the StellarStream widget for claiming tokens.`,
    );
  };

  const filteredStreams =
    filterStatus === 'all' ? streams : streams.filter((s) => s.status === filterStatus);

  const totalEarnings = streams.reduce((sum, s) => sum + s.totalAmount, 0);
  const activeStreams = streams.filter((s) => s.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments & Streams</h1>
          <p className="text-gray-600">View and manage your payment streams from completed tasks</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-gray-900">${totalEarnings.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Across all streams</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Active Streams</p>
            <p className="text-3xl font-bold text-green-600">{activeStreams}</p>
            <p className="text-xs text-gray-500 mt-1">Currently claimable</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Streams</p>
            <p className="text-3xl font-bold text-blue-600">{streams.length}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="all">All Streams</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_CREATION">Pending Creation</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading payment streams...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Streams List */}
        {!loading && !error && (
          <>
            {filteredStreams.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">
                  {filterStatus === 'all'
                    ? 'No payment streams yet. Complete tasks to earn payments!'
                    : `No ${filterStatus.toLowerCase()} streams found.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStreams.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} onViewStream={handleViewStream} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">About Payment Streams</h3>
          <p className="text-sm text-blue-800 mb-3">
            Your payments are distributed via Stellar blockchain using StellarStream smart
            contracts. This ensures transparent, secure, and automated token distribution.
          </p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Tokens are unlocked gradually over time</li>
            <li>You can claim available tokens at any time</li>
            <li>No gas fees for claiming on Stellar network</li>
            <li>All transactions are recorded on-chain</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
