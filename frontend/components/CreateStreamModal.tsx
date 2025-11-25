'use client';

import { useState } from 'react';
import { X, Calendar, Clock, User, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getErrorMessage } from '@/lib/contract';

interface CreateStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function CreateStreamModal({ isOpen, onClose, onSubmit }: CreateStreamModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    token: 'XLM', // Default
    duration: '3600', // Default 1 hour in seconds
    startTime: 'now',
  });

  const [customToken, setCustomToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.recipient.startsWith('G') || formData.recipient.length !== 56) {
      setError("❌ Geçersiz alıcı adresi. 'G' ile başlamalı ve 56 karakter uzunluğunda olmalı.");
      return;
    }

    if (formData.token === 'OTHER' && (!customToken.startsWith('C') || customToken.length !== 56)) {
      setError("❌ Geçersiz token adresi. 'C' ile başlamalı ve 56 karakter uzunluğunda olmalı.");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      setError("❌ Miktar 0'dan büyük olmalıdır.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        token: formData.token === 'OTHER' ? customToken : formData.token,
      });
      onClose();
      setError('');
    } catch (err) {
      console.error(err);
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ... (keep existing modal wrapper) ... */}
          <motion.div
            // ... (keep existing motion props) ...
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-6"
          >
            {/* ... (keep header) ... */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Create New Stream
              </h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ... (keep recipient input) ... */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Recipient Address
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    size={18}
                  />
                  <input
                    type="text"
                    required
                    placeholder="G..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Amount</label>
                  <div className="relative">
                    <DollarSign
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      size={18}
                    />
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Token</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                    value={formData.token}
                    onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  >
                    <option value="XLM">XLM</option>
                    <option value="OTHER">Custom</option>
                  </select>
                </div>
              </div>

              {formData.token === 'OTHER' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Token Contract Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="C..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value)}
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Duration</label>
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    size={18}
                  />
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  >
                    <option value="60">1 Minute (Test)</option>
                    <option value="3600">1 Hour</option>
                    <option value="86400">1 Day</option>
                    <option value="604800">1 Week</option>
                    <option value="2592000">30 Days</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? 'Creating Stream...' : 'Start Stream'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
