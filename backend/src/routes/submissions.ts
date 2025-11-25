import { Router } from 'express';
import { Submission } from '../models/Submission';
import { Assignment } from '../models/Assignment';
import { Task } from '../models/Task';
import { authenticate, requireAmbassador, AuthenticatedRequest } from '../middleware/auth';
import {
  asyncHandler,
  validationError,
  notFoundError,
  conflictError,
  createdResponse,
  successResponse,
} from '../utils/errorHandlers';
import { generateSubmissionId } from '../utils/helpers';

const router = Router();

// ============================================================================
// POST /assignments/:assignmentId/submit - Submit deliverables and KPIs
// ============================================================================

router.post(
  '/:assignmentId/submit',
  authenticate,
  requireAmbassador,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { assignmentId } = req.params;
    const { kpiValues, deliverables, additionalNotes } = req.body;
    const ambassadorId = req.user!.ambassadorId!;

    // Validation
    if (!kpiValues || !Array.isArray(kpiValues) || kpiValues.length === 0) {
      validationError(res, 'At least one KPI value is required');
      return;
    }

    if (!deliverables || !Array.isArray(deliverables) || deliverables.length === 0) {
      validationError(res, 'At least one deliverable is required');
      return;
    }

    // Verify assignment exists
    const assignment = await Assignment.findOne({ assignmentId });

    if (!assignment) {
      notFoundError(res, 'Assignment', assignmentId);
      return;
    }

    // Check authorization - only assigned ambassador can submit
    if (assignment.ambassadorId !== ambassadorId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You can only submit for your own assignments',
      });
      return;
    }

    // Check if assignment is in correct state for submission
    const validStatuses = ['ASSIGNED', 'AWAITING_SUBMISSION', 'REVISION_REQUESTED'];
    if (!validStatuses.includes(assignment.status)) {
      validationError(res, `Cannot submit for assignment with status: ${assignment.status}`);
      return;
    }

    // Check if submission already exists
    const existingSubmission = await Submission.findOne({ assignmentId });
    if (existingSubmission) {
      conflictError(
        res,
        'Submission already exists for this assignment. Use update endpoint instead.',
      );
      return;
    }

    // Get task to validate KPIs and deliverables
    const task = await Task.findOne({
      taskId: assignment.taskId,
      deletedAt: { $exists: false },
    });

    if (!task) {
      notFoundError(res, 'Task', assignment.taskId);
      return;
    }

    // Validate KPI values against task requirements
    const taskKpiIds = new Set(task.kpiRequirements.map((kpi) => kpi.kpiRequirementId));
    const submittedKpiIds = kpiValues.map(
      (kpi: { kpiRequirementId: string }) => kpi.kpiRequirementId,
    );

    const invalidKpiIds = submittedKpiIds.filter((id) => !taskKpiIds.has(id));
    if (invalidKpiIds.length > 0) {
      validationError(res, 'Invalid KPI requirement IDs', { invalidIds: invalidKpiIds });
      return;
    }

    // Validate deliverable requirements
    const taskDelIds = new Set(task.deliverableRequirements.map((del) => del.requirementId));
    const submittedDelIds = deliverables.map((del: { requirementId: string }) => del.requirementId);

    const invalidDelIds = submittedDelIds.filter((id) => !taskDelIds.has(id));
    if (invalidDelIds.length > 0) {
      validationError(res, 'Invalid deliverable requirement IDs', { invalidIds: invalidDelIds });
      return;
    }

    // Validate deliverable types
    const validTypes = ['PHOTO', 'VIDEO', 'REPORT', 'SOCIAL_POST', 'ARTICLE', 'OTHER'];
    const invalidTypes = deliverables
      .map((del: { type: string }) => del.type)
      .filter((type) => !validTypes.includes(type));

    if (invalidTypes.length > 0) {
      validationError(res, 'Invalid deliverable types', { invalidTypes });
      return;
    }

    // Create submission
    const submission = new Submission({
      submissionId: generateSubmissionId(),
      assignmentId,
      kpiValues: kpiValues.map(
        (kpi: { kpiRequirementId: string; actualValue: number; notes?: string }) => ({
          kpiRequirementId: kpi.kpiRequirementId,
          actualValue: kpi.actualValue,
          notes: kpi.notes,
        }),
      ),
      deliverables: deliverables.map(
        (del: {
          requirementId: string;
          type: string;
          fileUrl: string;
          fileName?: string;
          fileSize?: number;
          notes?: string;
        }) => ({
          requirementId: del.requirementId,
          type: del.type,
          fileUrl: del.fileUrl,
          fileName: del.fileName,
          fileSize: del.fileSize,
          notes: del.notes,
          uploadedAt: new Date(),
        }),
      ),
      additionalNotes,
      submittedAt: new Date(),
      submittedBy: req.user!.id,
    });

    await submission.save();

    // Update assignment status
    assignment.status = 'UNDER_REVIEW';
    await assignment.save();

    createdResponse(res, {
      submissionId: submission.submissionId,
      assignmentId: submission.assignmentId,
      kpiValues: submission.kpiValues,
      deliverables: submission.deliverables,
      submittedAt: submission.submittedAt,
    });
  }),
);

// ============================================================================
// GET /submissions/:submissionId - Get submission details
// ============================================================================

router.get(
  '/:submissionId',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { submissionId } = req.params;

    const submission = await Submission.findOne({ submissionId }).select('-__v').lean();

    if (!submission) {
      notFoundError(res, 'Submission', submissionId);
      return;
    }

    // Get assignment to check authorization
    const assignment = await Assignment.findOne({
      assignmentId: submission.assignmentId,
    }).lean();

    if (!assignment) {
      notFoundError(res, 'Assignment', submission.assignmentId);
      return;
    }

    // Authorization: only admin or assigned ambassador can view
    if (req.user!.role === 'ambassador' && assignment.ambassadorId !== req.user!.ambassadorId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You can only view your own submissions',
      });
      return;
    }

    // Optionally populate assignment and task details
    const task = await Task.findOne({
      taskId: assignment.taskId,
      deletedAt: { $exists: false },
    }).lean();

    successResponse(res, {
      ...submission,
      assignment,
      task,
    });
  }),
);

// ============================================================================
// GET /submissions - Get submissions list (with filters)
// ============================================================================

router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { assignmentId, ambassadorId } = req.query;

    const filter: Record<string, unknown> = {};

    if (assignmentId) {
      filter.assignmentId = assignmentId;
    }

    // If ambassador, only show their own submissions
    if (req.user!.role === 'ambassador') {
      // Need to find assignments for this ambassador first
      const assignments = await Assignment.find({
        ambassadorId: req.user!.ambassadorId,
      })
        .select('assignmentId')
        .lean();

      const assignmentIds = assignments.map((a) => a.assignmentId);
      filter.assignmentId = { $in: assignmentIds };
    } else if (ambassadorId) {
      // Admin can filter by any ambassadorId
      const assignments = await Assignment.find({
        ambassadorId,
      })
        .select('assignmentId')
        .lean();

      const assignmentIds = assignments.map((a) => a.assignmentId);
      filter.assignmentId = { $in: assignmentIds };
    }

    const submissions = await Submission.find(filter)
      .sort({ submittedAt: -1 })
      .select('-__v')
      .lean();

    // Optionally populate assignment info
    const assignmentIds = [...new Set(submissions.map((s) => s.assignmentId))];
    const assignments = await Assignment.find({
      assignmentId: { $in: assignmentIds },
    }).lean();

    const assignmentMap = new Map(assignments.map((a) => [a.assignmentId, a]));

    const submissionsWithAssignments = submissions.map((submission) => ({
      ...submission,
      assignment: assignmentMap.get(submission.assignmentId) || null,
    }));

    successResponse(res, { submissions: submissionsWithAssignments });
  }),
);

export default router;
