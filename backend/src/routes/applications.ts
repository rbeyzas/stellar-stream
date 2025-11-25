import { Router } from 'express';
import { TaskApplication } from '../models/TaskApplication';
import { Task } from '../models/Task';
import { authenticate, requireAmbassador, AuthenticatedRequest } from '../middleware/auth';
import {
  asyncHandler,
  validationError,
  notFoundError,
  conflictError,
  createdResponse,
} from '../utils/errorHandlers';
import { generateApplicationId } from '../utils/helpers';

const router = Router();

// ============================================================================
// POST /tasks/:taskId/apply - Ambassador applies to a task
// ============================================================================

router.post(
  '/:taskId/apply',
  authenticate,
  requireAmbassador,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { taskId } = req.params;
    const { coverLetter, pastRelevantExperience } = req.body;
    const ambassadorId = req.user!.ambassadorId!;

    // Validation
    if (!coverLetter) {
      validationError(res, 'Cover letter is required');
      return;
    }

    // Check if task exists and is open for applications
    const task = await Task.findOne({
      taskId,
      deletedAt: { $exists: false },
    });

    if (!task) {
      notFoundError(res, 'Task', taskId);
      return;
    }

    if (task.status !== 'PUBLISHED') {
      validationError(res, 'Task is not open for applications', { status: task.status });
      return;
    }

    // Check application deadline
    if (task.applicationDeadline && new Date(task.applicationDeadline) < new Date()) {
      validationError(res, 'Application deadline has passed');
      return;
    }

    // Check for existing active application
    const existingApplication = await TaskApplication.findOne({
      taskId,
      ambassadorId,
      status: { $in: ['PENDING', 'ACCEPTED'] },
    });

    if (existingApplication) {
      conflictError(res, 'You have already applied to this task');
      return;
    }

    // Create application
    const application = new TaskApplication({
      applicationId: generateApplicationId(),
      taskId,
      ambassadorId,
      coverLetter,
      pastRelevantExperience,
      status: 'PENDING',
      appliedAt: new Date(),
    });

    await application.save();

    createdResponse(res, {
      applicationId: application.applicationId,
      taskId: application.taskId,
      ambassadorId: application.ambassadorId,
      status: application.status,
      appliedAt: application.appliedAt,
    });
  }),
);

// ============================================================================
// GET /applications/my - Get ambassador's own applications
// ============================================================================

router.get(
  '/my',
  authenticate,
  requireAmbassador,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const ambassadorId = req.user!.ambassadorId!;
    const { status } = req.query;

    const filter: Record<string, unknown> = { ambassadorId };

    if (status) {
      filter.status = status;
    }

    const applications = await TaskApplication.find(filter)
      .sort({ appliedAt: -1 })
      .select('-__v')
      .lean();

    // Optionally populate task details
    const taskIds = applications.map((app) => app.taskId);
    const tasks = await Task.find({
      taskId: { $in: taskIds },
      deletedAt: { $exists: false },
    }).lean();

    const taskMap = new Map(tasks.map((t) => [t.taskId, t]));

    const applicationsWithTasks = applications.map((app) => ({
      ...app,
      task: taskMap.get(app.taskId) || null,
    }));

    res.json({ applications: applicationsWithTasks });
  }),
);

// ============================================================================
// GET /applications/:taskId - Get applications for a specific task (Admin)
// ============================================================================

router.get(
  '/:taskId',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { taskId } = req.params;
    const { status } = req.query;

    // Only admins can view all applications
    if (req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const filter: Record<string, unknown> = { taskId };

    if (status) {
      filter.status = status;
    }

    const applications = await TaskApplication.find(filter)
      .sort({ appliedAt: -1 })
      .select('-__v')
      .lean();

    res.json({ applications });
  }),
);

export default router;
