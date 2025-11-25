import { Router } from 'express';
import { Assignment } from '../models/Assignment';
import { Task } from '../models/Task';
import { TaskApplication } from '../models/TaskApplication';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import {
  asyncHandler,
  notFoundError,
  conflictError,
  createdResponse,
  successResponse,
} from '../utils/errorHandlers';
import { generateAssignmentId } from '../utils/helpers';

const router = Router();

// ============================================================================
// POST /tasks/:taskId/assign/:applicationId - Assign ambassador to task (Admin)
// ============================================================================

router.post(
  '/:taskId/assign/:applicationId',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { taskId, applicationId } = req.params;
    const { adminNotes } = req.body;

    // Verify task exists
    const task = await Task.findOne({
      taskId,
      deletedAt: { $exists: false },
    });

    if (!task) {
      notFoundError(res, 'Task', taskId);
      return;
    }

    // Check if task is already assigned
    if (task.status === 'ASSIGNED') {
      conflictError(res, 'Task is already assigned to an ambassador');
      return;
    }

    // Verify application exists and belongs to this task
    const application = await TaskApplication.findOne({
      applicationId,
      taskId,
    });

    if (!application) {
      notFoundError(res, 'Application', applicationId);
      return;
    }

    if (application.status !== 'PENDING') {
      conflictError(res, `Application status is ${application.status}, must be PENDING`);
      return;
    }

    // Check if this application already has an assignment
    const existingAssignment = await Assignment.findOne({ applicationId });
    if (existingAssignment) {
      conflictError(res, 'This application already has an assignment');
      return;
    }

    // Create assignment
    const assignment = new Assignment({
      assignmentId: generateAssignmentId(),
      taskId,
      ambassadorId: application.ambassadorId,
      applicationId,
      status: 'ASSIGNED',
      assignedAt: new Date(),
      assignedBy: req.user!.id,
      adminNotes,
    });

    await assignment.save();

    // Update task status
    task.status = 'ASSIGNED';
    task.assignedAmbassadorId = application.ambassadorId;
    await task.save();

    // Update application status
    application.status = 'ACCEPTED';
    application.reviewedAt = new Date();
    application.reviewedBy = req.user!.id;
    await application.save();

    // Reject other pending applications for this task
    await TaskApplication.updateMany(
      {
        taskId,
        applicationId: { $ne: applicationId },
        status: 'PENDING',
      },
      {
        $set: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: req.user!.id,
          rejectionReason: 'Another ambassador was selected for this task',
        },
      },
    );

    createdResponse(res, {
      assignmentId: assignment.assignmentId,
      taskId: assignment.taskId,
      ambassadorId: assignment.ambassadorId,
      applicationId: assignment.applicationId,
      status: assignment.status,
      assignedAt: assignment.assignedAt,
    });
  }),
);

// ============================================================================
// GET /assignments/:id - Get assignment details
// ============================================================================

router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    const assignment = await Assignment.findOne({ assignmentId: id }).select('-__v').lean();

    if (!assignment) {
      notFoundError(res, 'Assignment', id);
      return;
    }

    // Authorization: only admin or assigned ambassador can view
    if (req.user!.role === 'ambassador' && assignment.ambassadorId !== req.user!.ambassadorId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You can only view your own assignments',
      });
      return;
    }

    // Populate task details
    const task = await Task.findOne({
      taskId: assignment.taskId,
      deletedAt: { $exists: false },
    }).lean();

    // Populate application details
    const application = await TaskApplication.findOne({
      applicationId: assignment.applicationId,
    }).lean();

    successResponse(res, {
      ...assignment,
      task,
      application,
    });
  }),
);

// ============================================================================
// GET /assignments - Get all assignments with filters
// ============================================================================

router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { status, ambassadorId } = req.query;

    const filter: Record<string, unknown> = {};

    // If ambassador, only show their own assignments
    if (req.user!.role === 'ambassador') {
      filter.ambassadorId = req.user!.ambassadorId;
    } else if (ambassadorId) {
      // Admin can filter by any ambassadorId
      filter.ambassadorId = ambassadorId;
    }

    if (status) {
      filter.status = status;
    }

    const assignments = await Assignment.find(filter)
      .sort({ assignedAt: -1 })
      .select('-__v')
      .lean();

    // Optionally populate task info
    const taskIds = [...new Set(assignments.map((a) => a.taskId))];
    const tasks = await Task.find({
      taskId: { $in: taskIds },
      deletedAt: { $exists: false },
    }).lean();

    const taskMap = new Map(tasks.map((t) => [t.taskId, t]));

    const assignmentsWithTasks = assignments.map((assignment) => ({
      ...assignment,
      task: taskMap.get(assignment.taskId) || null,
    }));

    successResponse(res, { assignments: assignmentsWithTasks });
  }),
);

export default router;
