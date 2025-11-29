'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { submitTransaction } from '@/lib/stellar';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  builderWallet: string;
  builderName: string;
  taskTitle: string;
  amount: string;
  reviewNotes: string;
  adminWallet: string;
  onSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  submissionId,
  builderWallet,
  builderName,
  taskTitle,
  amount,
  reviewNotes,
  adminWallet,
  onSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionHash, setTransactionHash] = useState('');

  const handlePayment = async () => {
    if (!StellarSdk.StrKey.isValidEd25519PublicKey(builderWallet)) {
      setErrorMessage('Invalid builder wallet address. Please check the builder\'s profile.');
      setStep('error');
      return;
    }

    setStep('processing');
    setErrorMessage('');

    try {
      // Create Stellar payment transaction
      const server = new StellarSdk.rpc.Server('https://soroban-testnet.stellar.org:443');
      const sourceAccount = await server.getAccount(adminWallet);

      // Build transaction
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: builderWallet,
            asset: StellarSdk.Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(30)
        .addMemo(StellarSdk.Memo.text(`Task: ${taskTitle.substring(0, 20)}`))
        .build();

      // Sign and submit transaction using Freighter
      const txResult = await submitTransaction(
        transaction.toXDR(),
        StellarSdk.Networks.TESTNET
      );

      if (!txResult) {
        throw new Error('Transaction failed: No response from server');
      }

      const hash = (txResult as any).hash;
      setTransactionHash(hash);

      // Update submission in database
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          amount,
          transactionHash: hash,
          reviewNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to update submission');
      }

      setStep('success');
    } catch (error: unknown) {
      console.error('Payment error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(message);
      setStep('error');
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      onSuccess();
    }
    onClose();
    // Reset state
    setTimeout(() => {
      setStep('confirm');
      setErrorMessage('');
      setTransactionHash('');
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
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Wallet className="w-6 h-6" />
                  <span>Process Payment</span>
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
                    <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Task</p>
                        <p className="font-semibold text-gray-900">{taskTitle}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Builder</p>
                        <p className="font-semibold text-gray-900">{builderName}</p>
                        <p className="text-xs text-gray-500 font-mono">{builderWallet}</p>
                      </div>
                      <div className="border-t border-purple-200 pt-3">
                        <p className="text-sm text-gray-600">Payment Amount</p>
                        <p className="text-3xl font-bold text-purple-600">{amount} XLM</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>⚠️ Important:</strong> This will deduct {amount} XLM from your
                        wallet. Make sure you have sufficient balance.
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
                        onClick={handlePayment}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                      >
                        Confirm & Pay
                      </button>
                    </div>
                  </div>
                )}

                {step === 'processing' && (
                  <div className="text-center py-8">
                    <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
                    <p className="text-gray-600 mb-4">
                      Please confirm the transaction in your wallet...
                    </p>
                    <div className="bg-purple-50 rounded-lg p-4 text-sm text-gray-600">
                      <p>🔐 Freighter wallet will prompt you to sign the transaction</p>
                      <p className="mt-2">⏳ This may take a few moments</p>
                    </div>
                  </div>
                )}

                {step === 'success' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                    <p className="text-gray-600 mb-4">
                      {amount} XLM has been sent to {builderName}
                    </p>
                    {transactionHash && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600 mb-1">Transaction Hash</p>
                        <p className="text-xs font-mono text-gray-900 break-all">
                          {transactionHash}
                        </p>
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-600 hover:text-purple-700 mt-2 inline-block"
                        >
                          View on Stellar Expert →
                        </a>
                      </div>
                    )}
                    <button
                      onClick={handleClose}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h3>
                    <p className="text-gray-600 mb-4">{errorMessage}</p>
                    <div className="bg-red-50 rounded-lg p-4 mb-4 text-left">
                      <p className="text-sm text-red-800">
                        <strong>Common issues:</strong>
                      </p>
                      <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                        <li>Insufficient XLM balance in your wallet</li>
                        <li>Transaction rejected in Freighter wallet</li>
                        <li>Builder wallet address is invalid</li>
                        <li>Network connection issues</li>
                      </ul>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setStep('confirm');
                          setErrorMessage('');
                        }}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                      >
                        Try Again
                      </button>
                    </div>
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
