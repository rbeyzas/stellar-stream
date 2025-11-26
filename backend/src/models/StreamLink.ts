import mongoose, { Document, Schema, Model } from 'mongoose';

// ============================================================================
// Stream Configuration Types
// ============================================================================

export type StreamModel = 'UPFRONT_CHUNK' | 'LINEAR_DURING_EVENT' | 'POST_EVENT' | 'HYBRID';
export type StreamStatus = 'PENDING_CREATION' | 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'COMPLETED';

export interface StreamConfig {
  model: StreamModel;
  upfrontPercentage?: number; // For UPFRONT_CHUNK or HYBRID (e.g., 30)
  remainingPercentage?: number; // For HYBRID (e.g., 70)
  linearDurationDays?: number; // For LINEAR_DURING_EVENT
  postEventDurationDays?: number; // For POST_EVENT (e.g., 1 for immediate)
}

// ============================================================================
// Stream Link Interface
// ============================================================================

export interface IStreamLink extends Document {
  streamLinkId: string;
  assignmentId: string;
  ambassadorId: string;

  // Stellar/Soroban Details
  stellarStreamId?: string; // Contract stream ID
  contractId: string; // Deployed contract address
  assetCode: string; // USDC, XLM, etc.
  assetIssuer?: string;

  // Amounts
  totalAmount: number;
  vestedAmount?: number; // Amount vested so far (from contract)
  withdrawnAmount?: number; // Amount already withdrawn

  // Configuration
  config: StreamConfig;
  status: StreamStatus;

  // Timing
  streamStartTime?: Date;
  streamEndTime?: Date;
  pausedAt?: Date;
  resumedAt?: Date;

  // Metadata
  notes?: string;
  txHash?: string; // Creation transaction hash

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin user ID
}

// ============================================================================
// Stream Link Schema
// ============================================================================

const StreamLinkSchema = new Schema<IStreamLink>(
  {
    streamLinkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    assignmentId: {
      type: String,
      required: true,
      index: true,
    },
    ambassadorId: {
      type: String,
      required: true,
      index: true,
    },
    stellarStreamId: {
      type: String,
      index: true,
      sparse: true,
    },
    contractId: {
      type: String,
      required: true,
    },
    assetCode: {
      type: String,
      required: true,
      default: 'USDC',
    },
    assetIssuer: {
      type: String,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    vestedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    withdrawnAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    config: {
      model: {
        type: String,
        enum: ['UPFRONT_CHUNK', 'LINEAR_DURING_EVENT', 'POST_EVENT', 'HYBRID'],
        required: true,
      },
      upfrontPercentage: {
        type: Number,
        min: 0,
        max: 100,
      },
      remainingPercentage: {
        type: Number,
        min: 0,
        max: 100,
      },
      linearDurationDays: {
        type: Number,
        min: 1,
      },
      postEventDurationDays: {
        type: Number,
        min: 1,
        default: 1,
      },
    },
    status: {
      type: String,
      enum: ['PENDING_CREATION', 'ACTIVE', 'PAUSED', 'CANCELLED', 'COMPLETED'],
      required: true,
      default: 'PENDING_CREATION',
      index: true,
    },
    streamStartTime: {
      type: Date,
    },
    streamEndTime: {
      type: Date,
    },
    pausedAt: {
      type: Date,
    },
    resumedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
    txHash: {
      type: String,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// ============================================================================
// Indexes
// ============================================================================

StreamLinkSchema.index({ assignmentId: 1, status: 1 });
StreamLinkSchema.index({ ambassadorId: 1, createdAt: -1 });
StreamLinkSchema.index({ status: 1, streamStartTime: 1 });

// ============================================================================
// Model Export
// ============================================================================

export const StreamLink: Model<IStreamLink> =
  mongoose.models.StreamLink || mongoose.model<IStreamLink>('StreamLink', StreamLinkSchema);
