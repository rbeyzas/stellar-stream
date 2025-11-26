import { KPICheckResult, KPIStatus } from '../models/Review';

// ============================================================================
// KPI Evaluation Service
// ============================================================================

export interface KPIRequirement {
  kpiRequirementId: string;
  metric: string;
  target: number;
  description?: string;
}

export interface KPIValue {
  kpiRequirementId: string;
  actualValue: number;
  notes?: string;
}

export interface KPIEvaluationResult {
  kpiCheckResults: KPICheckResult[];
  allKpisMet: boolean;
  kpiAchievementRatio: number; // 0.0 to 2.0 (can exceed)
  autoSuggestion: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  paymentMultiplier: number; // 0.0 to 1.0
}

/**
 * Evaluates KPI performance by comparing requirements vs actual values
 */
export function evaluateKpis(
  requirements: KPIRequirement[],
  values: KPIValue[],
): KPIEvaluationResult {
  const kpiCheckResults: KPICheckResult[] = [];
  let totalRatio = 0;
  let metCount = 0;

  for (const req of requirements) {
    const value = values.find((v) => v.kpiRequirementId === req.kpiRequirementId);
    const actualValue = value?.actualValue ?? 0;
    const requiredValue = req.target;

    // Calculate percentage achieved
    const percentageAchieved = requiredValue > 0 ? (actualValue / requiredValue) * 100 : 0;

    // Determine status
    let status: KPIStatus;
    if (actualValue >= requiredValue * 1.2) {
      // 120% or more = EXCEEDED
      status = 'EXCEEDED';
    } else if (actualValue >= requiredValue) {
      status = 'MET';
    } else {
      status = 'NOT_MET';
    }

    if (status === 'MET' || status === 'EXCEEDED') {
      metCount++;
    }

    kpiCheckResults.push({
      kpiRequirementId: req.kpiRequirementId,
      label: req.metric,
      requiredValue,
      actualValue,
      status,
      percentageAchieved: Math.round(percentageAchieved),
    });

    // Add to total ratio (capped at 1.5 per KPI to avoid over-weighting)
    const ratio = Math.min(actualValue / requiredValue, 1.5);
    totalRatio += ratio;
  }

  // Calculate overall metrics
  const kpiCount = requirements.length;
  const allKpisMet = kpiCount > 0 && metCount === kpiCount;
  const kpiAchievementRatio = kpiCount > 0 ? totalRatio / kpiCount : 0;

  // Auto-suggest decision based on KPI performance
  let autoSuggestion: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  if (allKpisMet) {
    autoSuggestion = 'APPROVED';
  } else if (kpiAchievementRatio >= 0.8) {
    // 80% or better - request changes but close to approval
    autoSuggestion = 'CHANGES_REQUESTED';
  } else {
    // Below 80% - likely reject
    autoSuggestion = 'REJECTED';
  }

  // Calculate payment multiplier for HYBRID model
  // Formula: clamp payment between 50% and 100% based on KPI achievement
  // - Below 70%: 50% payment
  // - 70-100%: Linear scale from 50% to 100%
  // - Above 100%: 100% (no bonus payment, just full amount)
  let paymentMultiplier: number;
  if (kpiAchievementRatio < 0.7) {
    paymentMultiplier = 0.5; // Minimum 50%
  } else if (kpiAchievementRatio >= 1.0) {
    paymentMultiplier = 1.0; // Full payment
  } else {
    // Linear interpolation between 0.7-1.0 ratio → 0.5-1.0 multiplier
    paymentMultiplier = 0.5 + ((kpiAchievementRatio - 0.7) / 0.3) * 0.5;
  }

  return {
    kpiCheckResults,
    allKpisMet,
    kpiAchievementRatio,
    autoSuggestion,
    paymentMultiplier: Math.round(paymentMultiplier * 100) / 100, // Round to 2 decimals
  };
}

/**
 * Calculate rating based on admin rating and KPI performance
 */
export function calculateFinalRating(
  adminRating: number, // 1-5
  kpiAchievementRatio: number, // 0.0 to 2.0
): { finalRating: number; kpiBonus: number } {
  // KPI bonus: up to +1.0 stars for exceptional performance
  // - 100% achievement: +0.3 bonus
  // - 120%+ achievement: +0.5 bonus
  // - 150%+ achievement: +1.0 bonus
  let kpiBonus = 0;
  if (kpiAchievementRatio >= 1.5) {
    kpiBonus = 1.0;
  } else if (kpiAchievementRatio >= 1.2) {
    kpiBonus = 0.5;
  } else if (kpiAchievementRatio >= 1.0) {
    kpiBonus = 0.3;
  } else if (kpiAchievementRatio >= 0.9) {
    kpiBonus = 0.1;
  }
  // Below 90%: no bonus

  // Clamp final rating between 1 and 5
  const finalRating = Math.max(1, Math.min(5, adminRating + kpiBonus));

  return {
    finalRating: Math.round(finalRating * 10) / 10, // Round to 1 decimal
    kpiBonus: Math.round(kpiBonus * 10) / 10,
  };
}

/**
 * Calculate recommended payment amount based on budget and KPI performance
 */
export function calculateRecommendedPayment(
  totalBudget: number,
  upfrontPaid: number,
  paymentMultiplier: number,
): number {
  const remainingBudget = totalBudget - upfrontPaid;
  const recommendedPayment = remainingBudget * paymentMultiplier;
  return Math.round(recommendedPayment * 100) / 100; // Round to 2 decimals
}

/**
 * Determines stream duration based on model and config
 */
export function calculateStreamDuration(
  model: string,
  eventStartDate?: Date,
  eventEndDate?: Date,
  customDays?: number,
): { startTime: Date; endTime: Date } {
  const now = new Date();

  switch (model) {
    case 'UPFRONT_CHUNK':
      // Short stream (1 hour) for immediate withdrawal
      return {
        startTime: now,
        endTime: new Date(now.getTime() + 60 * 60 * 1000),
      };

    case 'LINEAR_DURING_EVENT':
      if (!eventStartDate || !eventEndDate) {
        throw new Error('Event dates required for LINEAR_DURING_EVENT model');
      }
      return {
        startTime: eventStartDate,
        endTime: eventEndDate,
      };

    case 'POST_EVENT':
      // Short stream (1 day) for quick withdrawal after approval
      const durationDays = customDays || 1;
      return {
        startTime: now,
        endTime: new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000),
      };

    case 'HYBRID_UPFRONT':
      // Upfront chunk: 1 hour for immediate access
      return {
        startTime: now,
        endTime: new Date(now.getTime() + 60 * 60 * 1000),
      };

    case 'HYBRID_REMAINING':
      // Remaining amount: 7 days for gradual release after approval
      const remainingDays = customDays || 7;
      return {
        startTime: now,
        endTime: new Date(now.getTime() + remainingDays * 24 * 60 * 60 * 1000),
      };

    default:
      throw new Error(`Unknown stream model: ${model}`);
  }
}
