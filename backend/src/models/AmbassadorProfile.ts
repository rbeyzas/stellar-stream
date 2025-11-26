import mongoose, { Document, Schema, Model } from 'mongoose';

// ============================================================================
// Ambassador Profile Interface
// ============================================================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: Date;
}

export interface IAmbassadorProfile extends Document {
  profileId: string;
  userId: string;
  ambassadorId: string;

  // Display Info
  displayName: string;
  bio?: string;
  avatarUrl?: string;

  // Location
  country?: string;
  city?: string;
  timezone?: string;

  // Skills & Interests
  skills: string[];
  languages: string[];
  interests: string[];

  // Performance Metrics
  pastEventsCount: number;
  completedAssignmentsCount: number;
  totalParticipantsReached: number;
  totalProjectsCompleted: number;

  // Rating System
  avgRating: number; // 0.0 to 5.0
  totalRatingsCount: number;
  ratingBreakdown: {
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
  };

  // KPI Performance
  avgKpiAchievementRatio: number; // Average of all KPI ratios
  excellentPerformanceCount: number; // Times exceeded KPIs

  // Badges & Achievements
  badges: Badge[];
  level: string; // 'ROOKIE' | 'INTERMEDIATE' | 'TRUSTED' | 'ELITE'

  // Financial
  totalEarningsUSDC: number;
  activeStreamsCount: number;

  // Reliability
  onTimeSubmissionRate: number; // Percentage
  firstTimeApprovalRate: number; // Percentage

  // Status
  isVerified: boolean;
  isActive: boolean;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

// ============================================================================
// Ambassador Profile Schema
// ============================================================================

const AmbassadorProfileSchema = new Schema<IAmbassadorProfile>(
  {
    profileId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ambassadorId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    avatarUrl: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    timezone: {
      type: String,
    },
    skills: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    pastEventsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedAssignmentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalParticipantsReached: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalProjectsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatingsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratingBreakdown: {
      fiveStars: { type: Number, default: 0 },
      fourStars: { type: Number, default: 0 },
      threeStars: { type: Number, default: 0 },
      twoStars: { type: Number, default: 0 },
      oneStar: { type: Number, default: 0 },
    },
    avgKpiAchievementRatio: {
      type: Number,
      default: 0,
      min: 0,
    },
    excellentPerformanceCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    badges: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        earnedAt: { type: Date, required: true },
      },
    ],
    level: {
      type: String,
      enum: ['ROOKIE', 'INTERMEDIATE', 'TRUSTED', 'ELITE'],
      default: 'ROOKIE',
    },
    totalEarningsUSDC: {
      type: Number,
      default: 0,
      min: 0,
    },
    activeStreamsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    onTimeSubmissionRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    firstTimeApprovalRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActivityAt: {
      type: Date,
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

AmbassadorProfileSchema.index({ avgRating: -1, pastEventsCount: -1 });
AmbassadorProfileSchema.index({ level: 1, avgRating: -1 });
AmbassadorProfileSchema.index({ country: 1, isActive: 1 });

// ============================================================================
// Model Export
// ============================================================================

export const AmbassadorProfile: Model<IAmbassadorProfile> =
  mongoose.models.AmbassadorProfile ||
  mongoose.model<IAmbassadorProfile>('AmbassadorProfile', AmbassadorProfileSchema);
