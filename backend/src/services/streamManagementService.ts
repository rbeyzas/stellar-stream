import { StreamLink, IStreamLink, StreamConfig } from '../models/StreamLink';
import { Assignment } from '../models/Assignment';
import { Task } from '../models/Task';
import { generateStreamLinkId } from '../utils/helpers';
import { calculateStreamDuration } from './kpiEvaluationService';

// ============================================================================
// Stellar/Soroban Integration Types
// ============================================================================

interface CreateStreamParams {
  sender: string; // Admin/employer Stellar address
  recipient: string; // Ambassador Stellar address
  assetCode: string;
  assetIssuer?: string;
  totalAmount: number;
  startTime: Date;
  endTime: Date;
  cancellable: boolean;
}

interface StreamCreationResult {
  stellarStreamId: string;
  txHash: string;
  contractId: string;
}

// ============================================================================
// Stream Management Service
// ============================================================================

export class StreamManagementService {
  private contractId: string;
  private _networkPassphrase: string; // Reserved for Soroban SDK integration
  private _rpcUrl: string; // Reserved for Soroban SDK integration

  constructor(contractId: string, networkPassphrase: string, rpcUrl: string) {
    this.contractId = contractId;
    this._networkPassphrase = networkPassphrase;
    this._rpcUrl = rpcUrl;
  }

  /**
   * Creates a stream on the Soroban contract
   * This is a placeholder - actual implementation would use Stellar SDK
   */
  private async createSorobanStream(params: CreateStreamParams): Promise<StreamCreationResult> {
    // TODO: Actual Soroban contract invocation
    // Example pseudocode:
    //
    // const server = new SorobanRpc.Server(this.rpcUrl);
    // const contract = new Contract(this.contractId);
    //
    // const tx = new TransactionBuilder(sourceAccount, {...})
    //   .addOperation(contract.call(
    //     'create_stream',
    //     Address(params.sender),
    //     Address(params.recipient),
    //     Address(assetAddress),
    //     u128(params.totalAmount * 1e7), // Convert to stroops
    //     u64(params.startTime.getTime() / 1000),
    //     u64(params.endTime.getTime() / 1000),
    //     bool(params.cancellable)
    //   ))
    //   .setTimeout(300)
    //   .build();
    //
    // const prepared = await server.prepareTransaction(tx);
    // const signed = prepared.sign(adminKeypair);
    // const result = await server.sendTransaction(signed);
    // const streamId = parseStreamIdFromResult(result);

    // Mock implementation for now
    console.log('Creating Soroban stream with params:', params);
    const mockStreamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockTxHash = `tx_${Math.random().toString(36).substr(2, 16)}`;

    return {
      stellarStreamId: mockStreamId,
      txHash: mockTxHash,
      contractId: this.contractId,
    };
  }

  /**
   * UPFRONT_CHUNK: Create stream for immediate upfront payment
   */
  async createUpfrontStream(
    assignmentId: string,
    config: StreamConfig,
    senderAddress: string,
    recipientAddress: string,
  ): Promise<IStreamLink> {
    const assignment = await Assignment.findOne({ assignmentId });
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const task = await Task.findOne({ taskId: assignment.taskId });
    if (!task) {
      throw new Error('Task not found');
    }

    const upfrontPercentage = config.upfrontPercentage || 30;
    const upfrontAmount = (task.budgetUSDC * upfrontPercentage) / 100;

    const { startTime, endTime } = calculateStreamDuration('UPFRONT_CHUNK');

    // Create stream on Soroban
    const result = await this.createSorobanStream({
      sender: senderAddress,
      recipient: recipientAddress,
      assetCode: 'USDC',
      totalAmount: upfrontAmount,
      startTime,
      endTime,
      cancellable: true,
    });

    // Save to database
    const streamLink = new StreamLink({
      streamLinkId: generateStreamLinkId(),
      assignmentId,
      ambassadorId: assignment.ambassadorId,
      stellarStreamId: result.stellarStreamId,
      contractId: result.contractId,
      assetCode: 'USDC',
      totalAmount: upfrontAmount,
      config: { ...config, model: 'UPFRONT_CHUNK' },
      status: 'ACTIVE',
      streamStartTime: startTime,
      streamEndTime: endTime,
      txHash: result.txHash,
      createdBy: assignment.assignedBy,
    });

    await streamLink.save();
    return streamLink;
  }

  /**
   * LINEAR_DURING_EVENT: Create stream that vests linearly during event
   */
  async createLinearStream(
    assignmentId: string,
    config: StreamConfig,
    senderAddress: string,
    recipientAddress: string,
  ): Promise<IStreamLink> {
    const assignment = await Assignment.findOne({ assignmentId });
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const task = await Task.findOne({ taskId: assignment.taskId });
    if (!task) {
      throw new Error('Task not found');
    }

    const { startTime, endTime } = calculateStreamDuration(
      'LINEAR_DURING_EVENT',
      task.eventStartDate,
      task.eventEndDate,
    );

    const result = await this.createSorobanStream({
      sender: senderAddress,
      recipient: recipientAddress,
      assetCode: 'USDC',
      totalAmount: task.budgetUSDC,
      startTime,
      endTime,
      cancellable: true,
    });

    const streamLink = new StreamLink({
      streamLinkId: generateStreamLinkId(),
      assignmentId,
      ambassadorId: assignment.ambassadorId,
      stellarStreamId: result.stellarStreamId,
      contractId: result.contractId,
      assetCode: 'USDC',
      totalAmount: task.budgetUSDC,
      config: { ...config, model: 'LINEAR_DURING_EVENT' },
      status: 'ACTIVE',
      streamStartTime: startTime,
      streamEndTime: endTime,
      txHash: result.txHash,
      createdBy: assignment.assignedBy,
    });

    await streamLink.save();
    return streamLink;
  }

  /**
   * POST_EVENT: Create stream after review approval
   */
  async createPostEventStream(
    assignmentId: string,
    config: StreamConfig,
    amount: number,
    senderAddress: string,
    recipientAddress: string,
  ): Promise<IStreamLink> {
    const assignment = await Assignment.findOne({ assignmentId });
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const { startTime, endTime } = calculateStreamDuration(
      'POST_EVENT',
      undefined,
      undefined,
      config.postEventDurationDays,
    );

    const result = await this.createSorobanStream({
      sender: senderAddress,
      recipient: recipientAddress,
      assetCode: 'USDC',
      totalAmount: amount,
      startTime,
      endTime,
      cancellable: false, // Post-event payments are typically non-cancellable
    });

    const streamLink = new StreamLink({
      streamLinkId: generateStreamLinkId(),
      assignmentId,
      ambassadorId: assignment.ambassadorId,
      stellarStreamId: result.stellarStreamId,
      contractId: result.contractId,
      assetCode: 'USDC',
      totalAmount: amount,
      config: { ...config, model: 'POST_EVENT' },
      status: 'ACTIVE',
      streamStartTime: startTime,
      streamEndTime: endTime,
      txHash: result.txHash,
      createdBy: assignment.assignedBy,
    });

    await streamLink.save();
    return streamLink;
  }

  /**
   * HYBRID: Create both upfront and remaining streams
   */
  async createHybridStreams(
    assignmentId: string,
    config: StreamConfig,
    senderAddress: string,
    recipientAddress: string,
    phase: 'UPFRONT' | 'REMAINING',
    paymentMultiplier?: number,
  ): Promise<IStreamLink> {
    const assignment = await Assignment.findOne({ assignmentId });
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const task = await Task.findOne({ taskId: assignment.taskId });
    if (!task) {
      throw new Error('Task not found');
    }

    if (phase === 'UPFRONT') {
      // Create upfront chunk (30% by default)
      const upfrontPercentage = config.upfrontPercentage || 30;
      const upfrontAmount = (task.budgetUSDC * upfrontPercentage) / 100;

      const { startTime, endTime } = calculateStreamDuration('HYBRID_UPFRONT');

      const result = await this.createSorobanStream({
        sender: senderAddress,
        recipient: recipientAddress,
        assetCode: 'USDC',
        totalAmount: upfrontAmount,
        startTime,
        endTime,
        cancellable: true,
      });

      const streamLink = new StreamLink({
        streamLinkId: generateStreamLinkId(),
        assignmentId,
        ambassadorId: assignment.ambassadorId,
        stellarStreamId: result.stellarStreamId,
        contractId: result.contractId,
        assetCode: 'USDC',
        totalAmount: upfrontAmount,
        config: { ...config, model: 'HYBRID' },
        status: 'ACTIVE',
        streamStartTime: startTime,
        streamEndTime: endTime,
        notes: 'HYBRID - Upfront Payment',
        txHash: result.txHash,
        createdBy: assignment.assignedBy,
      });

      await streamLink.save();
      return streamLink;
    } else {
      // Create remaining stream (70% by default, adjusted by payment multiplier)
      const upfrontPercentage = config.upfrontPercentage || 30;
      const remainingPercentage = 100 - upfrontPercentage;
      const baseRemainingAmount = (task.budgetUSDC * remainingPercentage) / 100;

      // Apply payment multiplier based on KPI performance
      const multiplier = paymentMultiplier || 1.0;
      const finalAmount = baseRemainingAmount * multiplier;

      const { startTime, endTime } = calculateStreamDuration(
        'HYBRID_REMAINING',
        undefined,
        undefined,
        7,
      );

      const result = await this.createSorobanStream({
        sender: senderAddress,
        recipient: recipientAddress,
        assetCode: 'USDC',
        totalAmount: finalAmount,
        startTime,
        endTime,
        cancellable: false,
      });

      const streamLink = new StreamLink({
        streamLinkId: generateStreamLinkId(),
        assignmentId,
        ambassadorId: assignment.ambassadorId,
        stellarStreamId: result.stellarStreamId,
        contractId: result.contractId,
        assetCode: 'USDC',
        totalAmount: finalAmount,
        config: { ...config, model: 'HYBRID' },
        status: 'ACTIVE',
        streamStartTime: startTime,
        streamEndTime: endTime,
        notes: `HYBRID - Remaining Payment (${Math.round(multiplier * 100)}% of planned)`,
        txHash: result.txHash,
        createdBy: assignment.assignedBy,
      });

      await streamLink.save();
      return streamLink;
    }
  }

  /**
   * Pause a stream (calls Soroban pause_stream)
   */
  async pauseStream(streamLinkId: string, reason?: string): Promise<IStreamLink> {
    const streamLink = await StreamLink.findOne({ streamLinkId });
    if (!streamLink) {
      throw new Error('Stream not found');
    }

    if (streamLink.status !== 'ACTIVE') {
      throw new Error('Can only pause active streams');
    }

    // TODO: Call Soroban pause_stream(streamLink.stellarStreamId)
    console.log(`Pausing stream ${streamLink.stellarStreamId}. Reason: ${reason}`);

    streamLink.status = 'PAUSED';
    streamLink.pausedAt = new Date();
    if (reason) {
      streamLink.notes = (streamLink.notes || '') + `\nPaused: ${reason}`;
    }

    await streamLink.save();
    return streamLink;
  }

  /**
   * Resume a paused stream
   */
  async resumeStream(streamLinkId: string): Promise<IStreamLink> {
    const streamLink = await StreamLink.findOne({ streamLinkId });
    if (!streamLink) {
      throw new Error('Stream not found');
    }

    if (streamLink.status !== 'PAUSED') {
      throw new Error('Can only resume paused streams');
    }

    // TODO: Call Soroban resume_stream(streamLink.stellarStreamId)
    console.log(`Resuming stream ${streamLink.stellarStreamId}`);

    streamLink.status = 'ACTIVE';
    streamLink.resumedAt = new Date();

    await streamLink.save();
    return streamLink;
  }

  /**
   * Top-up a stream with additional funds
   */
  async topUpStream(
    streamLinkId: string,
    additionalAmount: number,
    _senderAddress: string, // Reserved for Soroban authorization
  ): Promise<IStreamLink> {
    const streamLink = await StreamLink.findOne({ streamLinkId });
    if (!streamLink) {
      throw new Error('Stream not found');
    }

    if (streamLink.status !== 'ACTIVE' && streamLink.status !== 'PAUSED') {
      throw new Error('Can only top-up active or paused streams');
    }

    // TODO: Call Soroban top_up_stream(streamLink.stellarStreamId, additionalAmount)
    console.log(`Topping up stream ${streamLink.stellarStreamId} with ${additionalAmount}`);

    streamLink.totalAmount += additionalAmount;
    streamLink.notes = (streamLink.notes || '') + `\nTop-up: +${additionalAmount} USDC`;

    await streamLink.save();
    return streamLink;
  }

  /**
   * Extend stream end time
   */
  async extendStream(streamLinkId: string, newEndTime: Date): Promise<IStreamLink> {
    const streamLink = await StreamLink.findOne({ streamLinkId });
    if (!streamLink) {
      throw new Error('Stream not found');
    }

    if (streamLink.status !== 'ACTIVE') {
      throw new Error('Can only extend active streams');
    }

    if (!streamLink.streamEndTime || newEndTime <= streamLink.streamEndTime) {
      throw new Error('New end time must be after current end time');
    }

    // TODO: Call Soroban extend_stream(streamLink.stellarStreamId, newEndTime)
    console.log(`Extending stream ${streamLink.stellarStreamId} to ${newEndTime}`);

    streamLink.streamEndTime = newEndTime;
    streamLink.notes = (streamLink.notes || '') + `\nExtended to: ${newEndTime.toISOString()}`;

    await streamLink.save();
    return streamLink;
  }

  /**
   * Cancel a stream
   */
  async cancelStream(streamLinkId: string, reason: string): Promise<IStreamLink> {
    const streamLink = await StreamLink.findOne({ streamLinkId });
    if (!streamLink) {
      throw new Error('Stream not found');
    }

    if (streamLink.status === 'CANCELLED' || streamLink.status === 'COMPLETED') {
      throw new Error('Stream already finalized');
    }

    // TODO: Call Soroban cancel_stream(streamLink.stellarStreamId)
    console.log(`Cancelling stream ${streamLink.stellarStreamId}. Reason: ${reason}`);

    streamLink.status = 'CANCELLED';
    streamLink.notes = (streamLink.notes || '') + `\nCancelled: ${reason}`;

    await streamLink.save();
    return streamLink;
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const streamManagementService = new StreamManagementService(
  process.env.SOROBAN_CONTRACT_ID || 'default-contract-id',
  process.env.STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
  process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
);
