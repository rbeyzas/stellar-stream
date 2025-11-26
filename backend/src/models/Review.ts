import mongoose, { Document, Schema, Model } from 'mongoose';

// ============================================================================
// KPI Types
// ============================================================================

export type KPIType = 'PARTICIPANTS' | 'PROJECTS' | 'ENGAGEMENT' | 'REACH' | 'CUSTOM';
export type KPIStatus = 'MET' | 'NOT_MET' | 'EXCEEDED';

export interface KPICheckResult {
  kpiRequirementId: string;
  label: string;
  requiredValue: number;
  actualValue: number;
  status: KPIStatus;
  percentageAchieved: number; // e.g., 120 if exceeded
}

// ============================================================================
// Review Types
// ============================================================================

export type ReviewDecision = 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export interface IReview extends Document {
  reviewId: string;
  assignmentId: string;
  submissionId: string;

  // Decision
  decision: ReviewDecision;
  autoSuggestion?: ReviewDecision; // Based on KPI check

  // KPI Evaluation
  kpiCheckResults: KPICheckResult[];
  allKpisMet: boolean;
  kpiAchievementRatio: number; // 0.0 to 1.0 (or higher if exceeded)

  // Rating
  adminRating?: number; // 1-5 stars
  kpiBonus?: number; // Calculated bonus based on performance
  finalRating?: number; // adminRating + kpiBonus, clamped

  // Feedback
  comments?: string;
  internalNotes?: string;

  // Payment Impact
  paymentMultiplier: number; // 0.0 to 1.0 - affects remaining payment
  recommendedPayment?: number; // Calculated based on KPI performance

  // Audit
  reviewedBy: string; // Admin user ID
  reviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Review Schema
// ============================================================================

const ReviewSchema = new Schema<IReview>(
  {
    reviewId: {
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
    submissionId: {
      type: String,
      required: true,
      index: true,
    },
    decision: {
      type: String,
      enum: ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'],
      required: true,
    },
    autoSuggestion: {
      type: String,
      enum: ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'],
    },
    kpiCheckResults: [
      {
        kpiRequirementId: {
          type: String,
          required: true,
        },
        label: {
          type: String,
          required: true,
        },
        requiredValue: {
          type: Number,
          required: true,
        },
        actualValue: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ['MET', 'NOT_MET', 'EXCEEDED'],
          required: true,
        },
        percentageAchieved: {
          type: Number,
          required: true,
        },
      },
    ],
    allKpisMet: {
      type: Boolean,
      required: true,
      default: false,
    },
    kpiAchievementRatio: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    adminRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    kpiBonus: {
      type: Number,
      min: 0,
      max: 2,
    },
    finalRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
    },
    internalNotes: {
      type: String,
    },
    paymentMultiplier: {
      type: Number,
      required: true,
      default: 1.0,
      min: 0,
      max: 1.0,
    },
    recommendedPayment: {
      type: Number,
      min: 0,
    },
    reviewedBy: {
      type: String,
      required: true,
    },
    reviewedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// ============================================================================
// Indexes
// ============================================================================

ReviewSchema.index({ assignmentId: 1, createdAt: -1 });
ReviewSchema.index({ submissionId: 1 });
ReviewSchema.index({ decision: 1, reviewedAt: -1 });

// ============================================================================
// Model Export
// ============================================================================

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
