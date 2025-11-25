import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================================================
// TaskApplication Document Interface & Schema
// ============================================================================

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface ITaskApplication extends Document {
  applicationId: string;
  taskId: string; // Reference to Task.taskId
  ambassadorId: string; // Reference to AmbassadorProfile.ambassadorId

  // Application content
  coverLetter: string;
  pastRelevantExperience?: string;

  // Status tracking
  status: ApplicationStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // Admin user ID
  rejectionReason?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const TaskApplicationSchema = new Schema<ITaskApplication>(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    taskId: {
      type: String,
      required: true,
      index: true,
      ref: 'Task', // Virtual reference for population
    },
    ambassadorId: {
      type: String,
      required: true,
      index: true,
    },

    // Application content
    coverLetter: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    pastRelevantExperience: {
      type: String,
      maxlength: 2000,
    },

    // Status tracking
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      default: 'PENDING',
      index: true,
    },
    appliedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: String,
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    collection: 'taskApplications',
  },
);

// ============================================================================
// Indexes for Performance
// ============================================================================
TaskApplicationSchema.index({ taskId: 1, ambassadorId: 1 }); // Prevent duplicate applications
TaskApplicationSchema.index({ ambassadorId: 1, status: 1 }); // Ambassador's applications
TaskApplicationSchema.index({ taskId: 1, status: 1 }); // Applications per task
TaskApplicationSchema.index({ status: 1, appliedAt: -1 }); // Pending applications sorted

// ============================================================================
// Validation Middleware
// ============================================================================
TaskApplicationSchema.pre('save', function (next) {
  // Auto-set reviewedAt when status changes from PENDING
  if (this.isModified('status') && this.status !== 'PENDING' && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  next();
});

// ============================================================================
// Static Methods
// ============================================================================
TaskApplicationSchema.statics.findActiveApplication = async function (
  taskId: string,
  ambassadorId: string,
) {
  return this.findOne({
    taskId,
    ambassadorId,
    status: { $in: ['PENDING', 'ACCEPTED'] },
  });
};

// ============================================================================
// Model Export
// ============================================================================
export const TaskApplication: Model<ITaskApplication> =
  mongoose.models.TaskApplication ||
  mongoose.model<ITaskApplication>('TaskApplication', TaskApplicationSchema);
