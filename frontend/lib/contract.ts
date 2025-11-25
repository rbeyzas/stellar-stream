import * as StellarSdk from "@stellar/stellar-sdk";
import { invokeContract, getRpcClient } from "./stellar";



export const getStream = async (streamId: string) => {
  const server = getRpcClient();
  
  // Use simulating to read state
  const operation = StellarSdk.Operation.invokeHostFunction({
    func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
      new StellarSdk.xdr.InvokeContractArgs({
        contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
        functionName: "get_stream",
        args: [StellarSdk.nativeToScVal(BigInt(streamId), { type: "u64" })],
      })
    ),
    auth: [],
  });

  // Let's use a random keypair for simulation to avoid needing the user's wallet for reads
  const dummyKeypair = StellarSdk.Keypair.random();
  const sourceAccount = new StellarSdk.Account(dummyKeypair.publicKey(), "0");
  
  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);
  
  if (!StellarSdk.rpc.Api.isSimulationSuccess(simulated)) {
     console.warn(`Stream ${streamId} not found or error fetching`);
     return null;
  }

  const result = simulated.result!.retval;
  if (!result) return null;
  
  return StellarSdk.scValToNative(result);
};

const CONTRACT_ID = "CCM4Q2O6QZ2ZJOPW6IN33MFIEMQZHUULOMJOIKRWISOVZ26F7HZ6YBVD"; 
export const XLM_TOKEN_ADDRESS = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"; // Native XLM on Testnet

export const getNextStreamId = async () => {
  const server = getRpcClient();
  
  const operation = StellarSdk.Operation.invokeHostFunction({
    func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
      new StellarSdk.xdr.InvokeContractArgs({
        contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
        functionName: "get_next_stream_id",
        args: [],
      })
    ),
    auth: [],
  });

  const dummyKeypair = StellarSdk.Keypair.random();
  const sourceAccount = new StellarSdk.Account(dummyKeypair.publicKey(), "0");
  
  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);
  
  if (!StellarSdk.rpc.Api.isSimulationSuccess(simulated)) {
     throw new Error("Failed to fetch next stream ID");
  }

  const result = simulated.result!.retval;
  return StellarSdk.scValToNative(result);
};

export const createStream = async (
  sender: string,
  recipient: string,
  amount: string,
  token: string,
  duration: string,
  startTime: string
) => {
  // Convert amount to stroops (7 decimals)
  const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 10000000));
  
  // Calculate times
  const start = startTime === "now" 
    ? Math.floor(Date.now() / 1000) 
    : Math.floor(new Date(startTime).getTime() / 1000);
  const stop = start + parseInt(duration);

  const operation = StellarSdk.Operation.invokeHostFunction({
    func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
      new StellarSdk.xdr.InvokeContractArgs({
        contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
        functionName: "create_stream",
        args: [
          new StellarSdk.Address(sender).toScVal(),
          new StellarSdk.Address(recipient).toScVal(),
          StellarSdk.nativeToScVal(amountBigInt, { type: "i128" }),
          new StellarSdk.Address(token).toScVal(),
          StellarSdk.nativeToScVal(start, { type: "u64" }),
          StellarSdk.nativeToScVal(stop, { type: "u64" }),
        ],
      })
    ),
    auth: [],
  });

  return await invokeContract(sender, operation);
};

export const withdrawFromStream = async (streamId: string, amount: string, recipient: string) => {
  // Convert amount to stroops
  const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 10000000));

  const operation = StellarSdk.Operation.invokeHostFunction({
    func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
      new StellarSdk.xdr.InvokeContractArgs({
        contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
        functionName: "withdraw",
        args: [
          StellarSdk.nativeToScVal(BigInt(streamId), { type: "u64" }),
          StellarSdk.nativeToScVal(amountBigInt, { type: "i128" }),
        ],
      })
    ),
    auth: [],
  });

  return await invokeContract(recipient, operation);
};

export const cancelStream = async (streamId: string, sender: string) => {
  const operation = StellarSdk.Operation.invokeHostFunction({
    func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
      new StellarSdk.xdr.InvokeContractArgs({
        contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
        functionName: "cancel_stream",
        args: [
          StellarSdk.nativeToScVal(BigInt(streamId), { type: "u64" }),
        ],
      })
    ),
    auth: [],
  });

  return await invokeContract(sender, operation);
};
