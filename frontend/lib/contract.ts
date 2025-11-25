import * as StellarSdk from '@stellar/stellar-sdk';
import { invokeContract, getRpcClient } from './stellar';

/**
 * StreamError codes from Soroban contract
 * Maps error numbers to user-friendly Turkish messages
 */
export enum StreamErrorCode {
  UnauthorizedSender = 1,
  UnauthorizedRecipient = 2,
  InvalidAmount = 3,
  InvalidTimeRange = 4,
  StreamNotStarted = 5,
  NothingToWithdraw = 6,
  Overflow = 7,
  AlreadyCanceled = 8,
  SenderCannotBeRecipient = 9,
  StreamNotFound = 10,
  InvalidStartTime = 11,
  WithdrawExceedsAvailable = 12,
}

/**
 * Translates StreamError codes to user-friendly Turkish messages
 */
export function getErrorMessage(error: unknown): string {
  // Try to extract error code from Stellar SDK error
  const errorString = error?.toString() || '';

  // Pattern: Error(Contract, #N) where N is error code
  const match = errorString.match(/#(\d+)/);
  if (match) {
    const errorCode = parseInt(match[1]);

    switch (errorCode) {
      case StreamErrorCode.UnauthorizedSender:
        return '❌ Yetkilendirme hatası: Bu işlem için göndericinin yetkisi yok.';
      case StreamErrorCode.UnauthorizedRecipient:
        return '❌ Yetkilendirme hatası: Bu işlem için alıcının yetkisi yok.';
      case StreamErrorCode.InvalidAmount:
        return "❌ Geçersiz miktar: Lütfen 0'dan büyük bir değer girin.";
      case StreamErrorCode.InvalidTimeRange:
        return '❌ Geçersiz zaman aralığı: Bitiş zamanı başlangıç zamanından sonra olmalı.';
      case StreamErrorCode.StreamNotStarted:
        return '⏰ Stream henüz başlamadı. Başlangıç zamanından sonra tekrar deneyin.';
      case StreamErrorCode.NothingToWithdraw:
        return "💰 Çekilecek bakiye yok. Daha fazla token'ın kazanılması için bekleyin.";
      case StreamErrorCode.Overflow:
        return '❌ Hesaplama hatası: Sayı çok büyük (overflow).';
      case StreamErrorCode.AlreadyCanceled:
        return '⚠️ Bu stream zaten iptal edilmiş. Tekrar iptal edilemez.';
      case StreamErrorCode.SenderCannotBeRecipient:
        return '❌ Gönderici ve alıcı aynı olamaz. Farklı bir adres seçin.';
      case StreamErrorCode.StreamNotFound:
        return "🔍 Stream bulunamadı. ID'yi kontrol edin.";
      case StreamErrorCode.InvalidStartTime:
        return '❌ Başlangıç zamanı çok geçmişte (30 günden eski olamaz).';
      case StreamErrorCode.WithdrawExceedsAvailable:
        return '💸 Çekmek istediğiniz miktar, kazanılmış bakiyeyi aşıyor. Daha az bir değer deneyin.';
      default:
        return `❌ Bilinmeyen hata kodu: ${errorCode}`;
    }
  }

  // Fallback generic message
  if (errorString.includes('insufficient balance')) {
    return '❌ Yetersiz bakiye. Lütfen cüzdanınızda yeterli token olduğundan emin olun.';
  }

  if (errorString.includes('User declined')) {
    return '🚫 İşlem reddedildi.';
  }

  return `❌ İşlem başarısız: ${errorString.substring(0, 100)}`;
}

const CONTRACT_ID = 'CCCT5YGDACYW3DKISDU47GAUAVPGGYTSAC3OM5ZA3IQ7J7KIIXPUHCZT'; // Updated with dust amount fix (< 10 stroops)
export const XLM_TOKEN_ADDRESS = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'; // Native XLM on Testnet

export const getStream = async (streamId: string) => {
  const server = getRpcClient();

  // Use simulating to read state
  const operation = StellarSdk.Operation.invokeHostFunction({
    func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
      new StellarSdk.xdr.InvokeContractArgs({
        contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
        functionName: 'get_stream',
        args: [StellarSdk.nativeToScVal(BigInt(streamId), { type: 'u64' })],
      }),
    ),
    auth: [],
  });

  // Let's use a random keypair for simulation to avoid needing the user's wallet for reads
  const dummyKeypair = StellarSdk.Keypair.random();
  const sourceAccount = new StellarSdk.Account(dummyKeypair.publicKey(), '0');

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

export const getStreamStatus = async (streamId: string) => {
  const server = getRpcClient();

  const operation = StellarSdk.Operation.invokeHostFunction({
    func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
      new StellarSdk.xdr.InvokeContractArgs({
        contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
        functionName: 'get_stream_status',
        args: [StellarSdk.nativeToScVal(BigInt(streamId), { type: 'u64' })],
      }),
    ),
    auth: [],
  });

  const dummyKeypair = StellarSdk.Keypair.random();
  const sourceAccount = new StellarSdk.Account(dummyKeypair.publicKey(), '0');

  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);

  if (!StellarSdk.rpc.Api.isSimulationSuccess(simulated)) {
    console.warn(
      `⚠️ get_stream_status failed for stream ${streamId} - contract might not be deployed with new version`,
    );
    return null;
  }

  const result = simulated.result!.retval;
  if (!result) return null;

  const statusCode = StellarSdk.scValToNative(result);

  // Map Soroban enum to frontend string
  const statusMap: Record<number, 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'> = {
    0: 'UPCOMING',
    1: 'ACTIVE',
    2: 'COMPLETED',
    3: 'CANCELLED',
  };

  const mappedStatus = statusMap[statusCode] || 'ACTIVE';
  console.log(`📊 Stream ${streamId} status from contract:`, statusCode, '→', mappedStatus);
  return mappedStatus;
};

export const getNextStreamId = async () => {
  const server = getRpcClient();

  const operation = StellarSdk.Operation.invokeHostFunction({
    func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
      new StellarSdk.xdr.InvokeContractArgs({
        contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
        functionName: 'get_next_stream_id',
        args: [],
      }),
    ),
    auth: [],
  });

  const dummyKeypair = StellarSdk.Keypair.random();
  const sourceAccount = new StellarSdk.Account(dummyKeypair.publicKey(), '0');

  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);

  if (!StellarSdk.rpc.Api.isSimulationSuccess(simulated)) {
    throw new Error('Failed to fetch next stream ID');
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
  startTime: string,
) => {
  // Convert amount to stroops (7 decimals)
  const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 10000000));

  // Calculate times
  const start =
    startTime === 'now'
      ? Math.floor(Date.now() / 1000)
      : Math.floor(new Date(startTime).getTime() / 1000);
  const stop = start + parseInt(duration);

  const operation = StellarSdk.Operation.invokeHostFunction({
    func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
      new StellarSdk.xdr.InvokeContractArgs({
        contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
        functionName: 'create_stream',
        args: [
          new StellarSdk.Address(sender).toScVal(),
          new StellarSdk.Address(recipient).toScVal(),
          StellarSdk.nativeToScVal(amountBigInt, { type: 'i128' }),
          new StellarSdk.Address(token).toScVal(),
          StellarSdk.nativeToScVal(start, { type: 'u64' }),
          StellarSdk.nativeToScVal(stop, { type: 'u64' }),
        ],
      }),
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
        functionName: 'withdraw',
        args: [
          StellarSdk.nativeToScVal(BigInt(streamId), { type: 'u64' }),
          StellarSdk.nativeToScVal(amountBigInt, { type: 'i128' }),
        ],
      }),
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
        functionName: 'cancel_stream',
        args: [StellarSdk.nativeToScVal(BigInt(streamId), { type: 'u64' })],
      }),
    ),
    auth: [],
  });

  return await invokeContract(sender, operation);
};
