import {
  isConnected,
  requestAccess,
  signTransaction,
  setAllowed,
} from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";

const TESTNET_PASSPHRASE = StellarSdk.Networks.TESTNET;
const RPC_URL = "https://soroban-testnet.stellar.org:443";

export const checkConnection = async () => {
  const isAllowed = await setAllowed();
  if (isAllowed) {
    return isAllowed;
  }
};

import { toast } from 'sonner';

export const connectWallet = async () => {
  if (await isConnected()) {
    const { address } = await requestAccess();
    return address;
  } else {
    toast.error("Please install Freighter Wallet extension");
    return null;
  }
};

export const getRpcClient = () => {
  return new StellarSdk.rpc.Server(RPC_URL);
};

export const submitTransaction = async (xdr: string, networkPassphrase = TESTNET_PASSPHRASE) => {
  // Freighter signTransaction returns { signedTxXdr: string } in newer versions
  const signedTx = await signTransaction(xdr, {
    networkPassphrase,
  });

  const server = getRpcClient();
  
  try {
    const result = await server.sendTransaction(StellarSdk.TransactionBuilder.fromXDR(signedTx.signedTxXdr, networkPassphrase));
    
    if (result.status !== "PENDING") {
        throw new Error(`Transaction failed to submit: ${result.status}`);
    }
    
    // Poll for status
    let status: string = result.status;
    let txResponse = null;
    const hash = result.hash;
    let attempts = 0;
    const maxAttempts = 30; // Wait up to 30 seconds
    
    while (status === "PENDING" || status === "NOT_FOUND") {
        if (attempts >= maxAttempts) {
          throw new Error("Transaction polling timed out");
        }
        
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        try {
          txResponse = await server.getTransaction(hash);
          status = txResponse.status;
        } catch (e: any) {
          // If 404, it might not be indexed yet, treat as NOT_FOUND and continue
          if (e.response && e.response.status === 404) {
             status = "NOT_FOUND";
          } else {
             throw e;
          }
        }
        
        attempts++;
    }

    if (status === "SUCCESS") {
        return { ...txResponse, hash };
    } else {
        throw new Error(`Transaction failed: ${status}`);
    }
  } catch (e) {
    console.error("Transaction failed", e);
    throw e;
  }
};

export const invokeContract = async (
  sourceAddress: string,
  operation: StellarSdk.xdr.Operation,
  networkPassphrase = TESTNET_PASSPHRASE
) => {
  const server = getRpcClient();
  const sourceAccount = await server.getAccount(sourceAddress);

  // 1. Build initial transaction
  let tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  // 2. Simulate transaction
  const simulated = await server.simulateTransaction(tx);
  
  if (!StellarSdk.rpc.Api.isSimulationSuccess(simulated)) {
      throw new Error("Simulation failed");
  }

  // 3. Assemble transaction with resources
  // Use prepareTransaction which is the modern replacement for assembleTransaction
  tx = await server.prepareTransaction(tx);

  // 4. Sign and submit
  return await submitTransaction(tx.toXDR(), networkPassphrase);
};
