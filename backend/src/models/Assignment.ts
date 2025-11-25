import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================================================
// Assignment Document Interface & Schema
// ============================================================================

export type AssignmentStatus =
  | 'ASSIGNED'
  | 'AWAITING_SUBMISSION'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REVISION_REQUESTED'
  | 'COMPLETED';

export interface IStreamLink {
  streamId: string;
  contractAddress: string;
  network: string;
  createdAt: Date;
}

const StreamLinkSchema = new Schema<IStreamLink>(
  {
    streamId: { type: String, required: true },
    contractAddress: { type: String, required: true },
    network: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

export interface IAssignment extends Document {
  assignmentId: string;
  taskId: string; // Reference to Task.taskId
  ambassadorId: string; // Reference to AmbassadorProfile.ambassadorId
  applicationId: string; // Reference to TaskApplication.applicationId

  // Status tracking
  status: AssignmentStatus;
  assignedAt: Date;
  assignedBy: string; // Admin user ID
  completedAt?: Date;

  // Payment stream (will be populated later)
  streamLink?: IStreamLink;

  // Notes
  adminNotes?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    assignmentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    taskId: {
      type: String,
      required: true,
      index: true,
      ref: 'Task',
    },
    ambassadorId: {
      type: String,
      required: true,
      index: true,
    },
    applicationId: {
      type: String,
      required: true,
      unique: true, // One assignment per application
      index: true,
      ref: 'TaskApplication',
    },

    // Status tracking
    status: {
      type: String,
      required: true,
      enum: [
        'ASSIGNED',
        'AWAITING_SUBMISSION',
        'UNDER_REVIEW',
        'APPROVED',
        'REVISION_REQUESTED',
        'COMPLETED',
      ],
      default: 'ASSIGNED',
      index: true,
    },
    assignedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    assignedBy: {
      type: String,
      required: true,
    },
    completedAt: {
      type: Date,
      index: true,
    },

    // Payment stream (optional for now)
    streamLink: StreamLinkSchema,

    // Notes
    adminNotes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    collection: 'assignments',
  },
);

// ============================================================================
// Indexes for Performance
// ============================================================================
AssignmentSchema.index({ ambassadorId: 1, status: 1 }); // Ambassador's active assignments
AssignmentSchema.index({ taskId: 1, status: 1 }); // Task assignment lookup
AssignmentSchema.index({ status: 1, assignedAt: -1 }); // Dashboard queries

// ============================================================================
// Validation Middleware
// ============================================================================
AssignmentSchema.pre('save', function (next) {
  // Auto-set completedAt when status becomes COMPLETED
  if (this.isModified('status') && this.status === 'COMPLETED' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// ============================================================================
// Model Export
// ============================================================================
export const Assignment: Model<IAssignment> =
  mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);
