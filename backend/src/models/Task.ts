import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================================================
// Subdocument Schemas (Embedded in Task)
// ============================================================================

export interface IKPIRequirement {
  kpiRequirementId: string;
  metric: string;
  target: number;
  description?: string;
}

const KPIRequirementSchema = new Schema<IKPIRequirement>(
  {
    kpiRequirementId: { type: String, required: true },
    metric: { type: String, required: true },
    target: { type: Number, required: true },
    description: { type: String },
  },
  { _id: false },
);

export interface IDeliverableRequirement {
  requirementId: string;
  type: 'PHOTO' | 'VIDEO' | 'REPORT' | 'SOCIAL_POST' | 'ARTICLE' | 'OTHER';
  description: string;
  minQuantity?: number;
}

const DeliverableRequirementSchema = new Schema<IDeliverableRequirement>(
  {
    requirementId: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['PHOTO', 'VIDEO', 'REPORT', 'SOCIAL_POST', 'ARTICLE', 'OTHER'],
    },
    description: { type: String, required: true },
    minQuantity: { type: Number, default: 1 },
  },
  { _id: false },
);

// ============================================================================
// Task Document Interface & Schema
// ============================================================================

export type TaskStatus = 'DRAFT' | 'PUBLISHED' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';

export interface ITask extends Document {
  taskId: string;
  title: string;
  description: string;
  country: string;
  city?: string;
  language: string;
  budgetUSDC: number;
  applicationDeadline?: Date;
  eventStartDate: Date;
  eventEndDate: Date;
  tags: string[];
  status: TaskStatus;
  ecosystemId?: string;

  // Embedded subdocuments
  kpiRequirements: IKPIRequirement[];
  deliverableRequirements: IDeliverableRequirement[];

  // Metadata
  createdBy: string; // Admin user ID
  assignedAmbassadorId?: string; // Set when task is assigned
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    country: {
      type: String,
      required: true,
      index: true,
    },
    city: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      required: true,
    },
    budgetUSDC: {
      type: Number,
      required: true,
      min: 0,
    },
    applicationDeadline: {
      type: Date,
      index: true,
    },
    eventStartDate: {
      type: Date,
      required: true,
      index: true,
    },
    eventEndDate: {
      type: Date,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ['DRAFT', 'PUBLISHED', 'ASSIGNED', 'COMPLETED', 'CANCELLED'],
      default: 'DRAFT',
      index: true,
    },
    ecosystemId: {
      type: String,
      index: true,
    },

    // Embedded requirements
    kpiRequirements: [KPIRequirementSchema],
    deliverableRequirements: [DeliverableRequirementSchema],

    // Metadata
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    assignedAmbassadorId: {
      type: String,
      index: true,
    },
    deletedAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'tasks',
  },
);

// ============================================================================
// Indexes for Performance
// ============================================================================
TaskSchema.index({ status: 1, applicationDeadline: 1 }); // For open tasks query
TaskSchema.index({ country: 1, city: 1, status: 1 }); // For location-based filtering
TaskSchema.index({ eventStartDate: 1, eventEndDate: 1 }); // For date range queries
TaskSchema.index({ createdAt: -1 }); // For sorting by newest

// ============================================================================
// Validation Middleware
// ============================================================================
TaskSchema.pre('save', function (next) {
  // Validate date logic
  if (this.eventEndDate <= this.eventStartDate) {
    return next(new Error('eventEndDate must be after eventStartDate'));
  }

  if (this.applicationDeadline && this.applicationDeadline >= this.eventStartDate) {
    return next(new Error('applicationDeadline must be before eventStartDate'));
  }

  next();
});

// ============================================================================
// Model Export
// ============================================================================
export const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
