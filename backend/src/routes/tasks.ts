import { Router } from 'express';
import { Task } from '../models/Task';
import { TaskApplication } from '../models/TaskApplication';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import {
  asyncHandler,
  validationError,
  notFoundError,
  createdResponse,
  successResponse,
} from '../utils/errorHandlers';
import {
  generateTaskId,
  generateKPIRequirementId,
  generateDeliverableRequirementId,
  parsePagination,
  buildDateRangeFilter,
  canApplyToTask,
} from '../utils/helpers';

const router = Router();

// ============================================================================
// 1. POST /tasks - Create a new task (Admin only)
// ============================================================================

router.post(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const {
      title,
      description,
      language,
      budgetUSDC,
      applicationDeadline,
      tags = [],
      kpiRequirements = [],
      deliverableRequirements = [],
      publish = false, // Flag to publish immediately or save as draft
    } = req.body;

    // Validation
    if (!title || !description || !language || !budgetUSDC) {
      validationError(res, 'Missing required fields', {
        required: ['title', 'description', 'language', 'budgetUSDC'],
      });
      return;
    }

    // Validate deadline if provided
    if (applicationDeadline) {
      const deadline = new Date(applicationDeadline);
      if (isNaN(deadline.getTime())) {
        validationError(res, 'Invalid application deadline');
        return;
      }
    }

    // Generate IDs for requirements
    const kpiRequirementsWithIds = kpiRequirements.map(
      (kpi: { metric: string; target: number; description?: string }) => ({
        kpiRequirementId: generateKPIRequirementId(),
        ...kpi,
      }),
    );

    const deliverableRequirementsWithIds = deliverableRequirements.map(
      (del: { type: string; description: string; minQuantity?: number }) => ({
        requirementId: generateDeliverableRequirementId(),
        ...del,
      }),
    );

    // Create task with default values for removed fields
    const task = new Task({
      taskId: generateTaskId(),
      title,
      description,
      country: 'Global',
      city: undefined,
      language,
      budgetUSDC,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
      eventStartDate: new Date(),
      eventEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      tags,
      ecosystemId: undefined,
      status: publish ? 'PUBLISHED' : 'DRAFT',
      kpiRequirements: kpiRequirementsWithIds,
      deliverableRequirements: deliverableRequirementsWithIds,
      createdBy: req.user!.id,
    });

    await task.save();

    createdResponse(res, {
      taskId: task.taskId,
      title: task.title,
      status: task.status,
      kpiRequirements: task.kpiRequirements,
      deliverableRequirements: task.deliverableRequirements,
      createdAt: task.createdAt,
    });
  }),
);

// ============================================================================
// 2. GET /tasks/open - Get open tasks for ambassadors (Public - NO AUTH)
// ============================================================================

router.get(
  '/open',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { country, city, language, page, limit } = req.query;

    // Filter for open tasks
    const filter: Record<string, unknown> = {
      status: 'PUBLISHED',
      deletedAt: { $exists: false },
      $or: [
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: { $gte: new Date() } },
      ],
    };

    if (country) {
      filter.country = country;
    }

    if (city) {
      filter.city = city;
    }

    if (language) {
      filter.language = language;
    }

    // Pagination
    const pagination = parsePagination(page as string, limit as string);

    // Query - simplified view for browsing
    const tasks = await Task.find(filter)
      .sort({ eventStartDate: 1 }) // Soonest events first
      .skip(pagination.skip)
      .limit(pagination.limit)
      .select(
        'taskId title description country city language budgetUSDC applicationDeadline eventStartDate eventEndDate tags kpiRequirements deliverableRequirements',
      )
      .lean();

    const total = await Task.countDocuments(filter);

    successResponse(res, {
      tasks: tasks.map((task) => ({
        ...task,
        canApply: canApplyToTask(task.status, task.applicationDeadline),
      })),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  }),
);

// ============================================================================
// 3. GET /tasks - List tasks with filters (Admin)
// ============================================================================

router.get(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { status, country, city, from, to, page, limit } = req.query;

    // Build filter
    const filter: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (status) {
      filter.status = status;
    }

    if (country) {
      filter.country = country;
    }

    if (city) {
      filter.city = city;
    }

    // Date range filter for eventStartDate
    if (from || to) {
      const dateFilter = buildDateRangeFilter(from as string, to as string);
      if (Object.keys(dateFilter).length > 0) {
        filter.eventStartDate = dateFilter;
      }
    }

    // Pagination
    const pagination = parsePagination(page as string, limit as string);

    // Query
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .select('-__v')
      .lean();

    const total = await Task.countDocuments(filter);

    successResponse(res, {
      tasks,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  }),
);

// ============================================================================
// 4. GET /tasks/:id - Get single task details (Admin)
// ============================================================================

router.get(
  '/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    const task = await Task.findOne({ taskId: id, deletedAt: { $exists: false } })
      .select('-__v')
      .lean();

    if (!task) {
      notFoundError(res, 'Task', id);
      return;
    }

    // Optionally include application count
    const applicationCount = await TaskApplication.countDocuments({ taskId: id });

    successResponse(res, {
      ...task,
      applicationCount,
    });
  }),
);

export default router;
