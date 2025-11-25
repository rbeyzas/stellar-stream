import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================================================
// Subdocument Schemas (Embedded in Submission)
// ============================================================================

export interface IKPIValue {
  kpiRequirementId: string;
  actualValue: number;
  notes?: string;
}

const KPIValueSchema = new Schema<IKPIValue>(
  {
    kpiRequirementId: { type: String, required: true },
    actualValue: { type: Number, required: true },
    notes: { type: String, maxlength: 500 },
  },
  { _id: false },
);

export interface IDeliverableUpload {
  requirementId: string;
  type: 'PHOTO' | 'VIDEO' | 'REPORT' | 'SOCIAL_POST' | 'ARTICLE' | 'OTHER';
  fileUrl: string; // Fake URL for now, will be S3/Cloudflare R2 later
  fileName?: string;
  fileSize?: number; // in bytes
  notes?: string;
  uploadedAt: Date;
}

const DeliverableUploadSchema = new Schema<IDeliverableUpload>(
  {
    requirementId: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['PHOTO', 'VIDEO', 'REPORT', 'SOCIAL_POST', 'ARTICLE', 'OTHER'],
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String },
    fileSize: { type: Number },
    notes: { type: String, maxlength: 500 },
    uploadedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

// ============================================================================
// Submission Document Interface & Schema
// ============================================================================

export interface ISubmission extends Document {
  submissionId: string;
  assignmentId: string; // Reference to Assignment.assignmentId

  // Submitted data
  kpiValues: IKPIValue[];
  deliverables: IDeliverableUpload[];

  // Additional notes from ambassador
  additionalNotes?: string;

  // Status tracking
  submittedAt: Date;
  submittedBy: string; // Ambassador user ID

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    submissionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    assignmentId: {
      type: String,
      required: true,
      index: true,
      ref: 'Assignment',
    },

    // Embedded subdocuments
    kpiValues: {
      type: [KPIValueSchema],
      required: true,
      validate: {
        validator: function (v: IKPIValue[]) {
          return v && v.length > 0;
        },
        message: 'At least one KPI value is required',
      },
    },
    deliverables: {
      type: [DeliverableUploadSchema],
      required: true,
      validate: {
        validator: function (v: IDeliverableUpload[]) {
          return v && v.length > 0;
        },
        message: 'At least one deliverable is required',
      },
    },

    // Additional content
    additionalNotes: {
      type: String,
      maxlength: 2000,
    },

    // Tracking
    submittedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    submittedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'submissions',
  },
);

// ============================================================================
// Indexes for Performance
// ============================================================================
SubmissionSchema.index({ assignmentId: 1 }); // Unique per assignment (one submission per assignment)
SubmissionSchema.index({ submittedAt: -1 }); // Latest submissions

// ============================================================================
// Validation Middleware
// ============================================================================
SubmissionSchema.pre('save', function (next) {
  // Ensure no duplicate KPI requirement IDs
  const kpiIds = this.kpiValues.map((kpi) => kpi.kpiRequirementId);
  const uniqueKpiIds = new Set(kpiIds);
  if (kpiIds.length !== uniqueKpiIds.size) {
    return next(new Error('Duplicate KPI requirement IDs found'));
  }

  // Ensure no duplicate deliverable requirement IDs
  const delIds = this.deliverables.map((del) => del.requirementId);
  const uniqueDelIds = new Set(delIds);
  if (delIds.length !== uniqueDelIds.size) {
    return next(new Error('Duplicate deliverable requirement IDs found'));
  }

  next();
});

// ============================================================================
// Model Export
// ============================================================================
export const Submission: Model<ISubmission> =
  mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
