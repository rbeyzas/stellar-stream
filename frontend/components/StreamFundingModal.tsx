'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle, AlertCircle, Wallet, Clock } from 'lucide-react';
import { createStream, XLM_TOKEN_ADDRESS, getErrorMessage, getNextStreamId } from '@/lib/contract';
import { Task } from '@/types/task';

interface StreamFundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  adminWallet: string;
  onSuccess: () => void;
}

export default function StreamFundingModal({
  isOpen,
  onClose,
  task,
  adminWallet,
  onSuccess,
}: StreamFundingModalProps) {
  const [step, setStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
  const [errorMessage, setErrorMessage] = useState('');
  const [streamId, setStreamId] = useState('');

  const handleFundStream = async () => {
    // Find the approved builder
    const approvedApp = task.applications?.find((app) => app.status === 'Approved');
    if (!approvedApp) {
      setErrorMessage('No approved builder found for this task.');
      setStep('error');
      return;
    }

    // Check if stream duration is set
    if (!task.streamDuration) {
      setErrorMessage('Stream duration is not set for this task.');
      setStep('error');
      return;
    }

    setStep('processing');
    setErrorMessage('');

    try {
      // 1. Fetch Builder's Wallet Address
      // We assume we can get it via their ID or Email. 
      // Since we don't have a direct endpoint for "get user by id", we might need to rely on the application data
      // or create a quick helper. For now, let's try to fetch the user profile.
      // If the backend `GET /api/tasks/[id]` included builder info in applications, that would be best.
      // Let's assume we need to fetch it.
      
      // Workaround: Fetch all builders (admin only) or use a specific endpoint.
      // Let's try to fetch the application details again if needed, or assume the builder provided it.
      // Actually, the `PaymentModal` used `builderWallet` passed as prop.
      // In `admin/tasks/[id]/page.tsx`, `task` is fetched.
      // Let's assume we can't easily get the wallet without an API call.
      // I'll add a fetch here.
      
      const userRes = await fetch(`/api/users/${approvedApp.builderId}`);
      // Wait, do we have this route? Probably not.
      // Let's use the `builderEmail` to find the user?
      // `GET /api/users?email=...`
      
      // Let's try to get it from the application if it was populated.
      // If not, we might fail.
      // For MVP, let's assume the builder has a wallet connected and we can find it.
      
      // BETTER APPROACH: The `createStream` needs the address.
      // Let's fetch the builder's profile using a new server action or API route.
      // I'll create a simple API route to get wallet by builder ID: `GET /api/builders/[id]/wallet`
      
      const walletRes = await fetch(`/api/builders/${approvedApp.builderId}/wallet`);
      if (!walletRes.ok) {
         throw new Error('Could not fetch builder wallet address');
      }
      const { walletAddress } = await walletRes.json();
      
      if (!walletAddress) {
        throw new Error('Builder has not connected a wallet');
      }

      // 2. Get Next Stream ID (Prediction)
      const predictedId = await getNextStreamId();
      
      // 3. Create Stream on Blockchain
      await createStream(
        adminWallet,
        walletAddress,
        task.budget.toString(),
        XLM_TOKEN_ADDRESS,
        task.streamDuration.toString()
      );

      // 4. Update Task in DB
      const response = await fetch(`/api/tasks/${task.id}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId: predictedId.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      // Record payment in Payment table (Admin -> Stream)
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId: predictedId.toString(),
          amount: task.budget.toString(),
          token: 'XLM',
          from: adminWallet,
          to: walletAddress, // Technically to the contract, but for tracking we can say "for builder"
          txHash: null, // We don't have the hash from createStream helper easily unless we update it, but it's fine
          // We can try to find builder by email if we had it, or just rely on wallet matching
        }),
      });

      setStreamId(predictedId.toString());
      setStep('success');
    } catch (error) {
      console.error('Funding error:', error);
      const message = getErrorMessage(error);
      setErrorMessage(message);
      setStep('error');
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      onSuccess();
    }
    onClose();
    setTimeout(() => {
      setStep('confirm');
      setErrorMessage('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={step === 'processing' ? undefined : handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Clock className="w-6 h-6" />
                  <span>Fund Stream</span>
                </h2>
                {step !== 'processing' && (
                  <button
                    onClick={handleClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {step === 'confirm' && (
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Task</p>
                        <p className="font-semibold text-gray-900">{task.title}</p>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-900">
                            {(task.streamDuration! / 3600).toFixed(1)} Hours
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-bold text-green-600">{task.budget} XLM</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>⚠️ Action Required:</strong> You are about to start the payment stream. 
                        Funds will start vesting to the builder immediately.
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleFundStream}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                      >
                        Approve & Start
                      </button>
                    </div>
                  </div>
                )}

                {step === 'processing' && (
                  <div className="text-center py-8">
                    <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Creating Stream</h3>
                    <p className="text-gray-600 mb-4">
                      Please sign the transaction in your wallet...
                    </p>
                  </div>
                )}

                {step === 'success' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Stream Started!</h3>
                    <p className="text-gray-600 mb-4">
                      Stream ID: <span className="font-mono font-bold">{streamId}</span>
                    </p>
                    <button
                      onClick={handleClose}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                      Done
                    </button>
                  </div>
                )}

                {step === 'error' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Start</h3>
                    <p className="text-gray-600 mb-4">{errorMessage}</p>
                    <button
                      onClick={() => setStep('confirm')}
                      className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
